const sql = require("mssql");
const {
  createShiftSchedulerHistory,
  createShiftSchedulerHistoryOnDelete,
  getShiftHistory,
  createShiftBreakHistory,
  getShiftBreakHistory,
} = require("../../v1/Services/sopShiftHistoryService");
const { getConnection } = require("../../v1/Database/dbConfig");

// Mock the SQL Server connection and requests
jest.mock("mssql");
jest.mock("../../v1/Database/dbConfig");

describe("Shift Scheduler Service", () => {
  // Mock data
  const mockPool = {
    request: jest.fn().mockReturnThis(),
    input: jest.fn().mockReturnThis(),
    query: jest.fn(),
    close: jest.fn(),
  };

  const mockShiftData = [
    { shiftid: 1, shiftname: "Morning" },
    { shiftid: 2, shiftname: "Evening" },
  ];

  const mockZoneData = [{ zone: "Zone1" }, { zone: "Zone2" }];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    getConnection.mockResolvedValue(mockPool);
    mockPool.query.mockReset();
  });

  describe("createShiftSchedulerHistory", () => {
    it("should create shift history records successfully", async () => {
      // Mock data
      const adid = "user123";
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const zones = ["Zone1"];
      const shifts = ["Morning"];

      // Mock database responses
      mockPool.query
        .mockResolvedValueOnce({ recordset: mockShiftData }) // First query for shifts
        .mockResolvedValueOnce({ recordset: mockZoneData }) // Second query for zones
        .mockResolvedValue({ rowsAffected: [1] }); // Insert queries

      await createShiftSchedulerHistory(adid, dateRange, zones, shifts);

      // Verify database calls
      expect(mockPool.query).toHaveBeenCalledTimes(3);
      expect(mockPool.input).toHaveBeenCalledWith("useradid", adid);
      expect(mockPool.close).toHaveBeenCalled();
    });

    it('should handle "all" zones and shifts', async () => {
      const adid = "user123";
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const zones = ["all"];
      const shifts = ["all"];

      mockPool.query
        .mockResolvedValueOnce({ recordset: mockShiftData })
        .mockResolvedValueOnce({ recordset: mockZoneData })
        .mockResolvedValue({ rowsAffected: [1] });

      await createShiftSchedulerHistory(adid, dateRange, zones, shifts);

      // Should create records for all combinations
      expect(mockPool.query).toHaveBeenCalledTimes(5); // 2 initial queries + 4 inserts
    });
  });

  describe("createShiftSchedulerHistoryOnDelete", () => {
    it("should create delete history record", async () => {
      const adid = "user123";
      const scheduledate = "2024-03-01";
      const shiftid = 1;
      const zones = "Zone1";

      await createShiftSchedulerHistoryOnDelete(
        adid,
        scheduledate,
        shiftid,
        zones
      );

      expect(mockPool.input).toHaveBeenCalledWith("useradid", adid);
      expect(mockPool.input).toHaveBeenCalledWith("actiontype", "Delete");
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe("getShiftHistory", () => {
    it("should retrieve shift history with date range filter", async () => {
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const zones = ["all"];
      const shifts = ["all"];

      const mockHistoryData = [
        { shiftid: 1, shiftname: "Morning", zone: "Zone1" },
      ];

      mockPool.query.mockResolvedValue({ recordset: mockHistoryData });

      const result = await getShiftHistory(dateRange, zones, shifts);

      expect(result).toEqual(mockHistoryData);
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith(
        "startDate",
        sql.DateTimeOffset,
        expect.any(Date)
      );
    });

    it("should filter by specific zones and shifts", async () => {
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const zones = ["Zone1"];
      const shifts = ["Morning"];

      const mockHistoryData = [
        { shiftid: 1, shiftname: "Morning", zone: "Zone1" },
      ];

      mockPool.query.mockResolvedValue({ recordset: mockHistoryData });

      const result = await getShiftHistory(dateRange, zones, shifts);

      expect(result).toEqual(mockHistoryData);
      expect(mockPool.input).toHaveBeenCalledWith(
        "zone0",
        sql.VarChar,
        "Zone1"
      );
      expect(mockPool.input).toHaveBeenCalledWith(
        "shift0",
        sql.VarChar,
        "Morning"
      );
    });
  });

  describe("createShiftBreakHistory", () => {
    it("should create break history record", async () => {
      const adid = "user123";
      const shiftid = 1;
      const breakstart = "09:00";
      const breakend = "09:15";
      const breakdescription = "Morning Break";
      const actiontype = "Create";

      await createShiftBreakHistory(
        adid,
        shiftid,
        breakstart,
        breakend,
        breakdescription,
        actiontype
      );

      expect(mockPool.input).toHaveBeenCalledWith("shiftid", shiftid);
      expect(mockPool.input).toHaveBeenCalledWith(
        "breakdescription",
        breakdescription
      );
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe("getShiftBreakHistory", () => {
    it("should retrieve break history with date range filter", async () => {
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const shifts = ["all"];

      const mockBreakData = [
        {
          shiftid: 1,
          shiftname: "Morning",
          breakstart: "09:00",
          breakend: "09:15",
        },
      ];

      mockPool.query.mockResolvedValue({ recordset: mockBreakData });

      const result = await getShiftBreakHistory(dateRange, shifts);

      expect(result).toEqual(mockBreakData);
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith(
        "startDate",
        sql.DateTimeOffset,
        expect.any(Date)
      );
    });

    it("should filter by specific shifts", async () => {
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const shifts = ["Morning"];

      const mockBreakData = [
        {
          shiftid: 1,
          shiftname: "Morning",
          breakstart: "09:00",
          breakend: "09:15",
        },
      ];

      mockPool.query.mockResolvedValue({ recordset: mockBreakData });

      const result = await getShiftBreakHistory(dateRange, shifts);

      expect(result).toEqual(mockBreakData);
      expect(mockPool.input).toHaveBeenCalledWith(
        "shift0",
        sql.VarChar,
        "Morning"
      );
    });
  });
});

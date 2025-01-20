const sql = require("mssql");
const {
  getShifts,
  getShiftBreaks,
  updateShiftBreak,
  deleteShiftBreak,
  getShiftSchedules,
  scheduleShifts,
  getExistingSchedules,
  deleteShiftSchedule,
  createShiftHighlights,
  getShiftHighlights,
} = require("../../v1/Services/sopShiftsService");
const { getConnection } = require("../../v1/Database/dbConfig");
// TODO Add deleteShiftSchedule tests later

// Mock the SQL Server connection and requests
jest.mock("mssql");
jest.mock("../../v1/Database/dbConfig");

describe("Shift Management Service", () => {
  // Mock data
  const mockPool = {
    request: jest.fn().mockReturnThis(),
    input: jest.fn().mockReturnThis(),
    query: jest.fn(),
    execute: jest.fn(),
  };

  const mockShifts = [
    { shiftid: 1, shiftname: "Morning" },
    { shiftid: 2, shiftname: "Evening" },
  ];

  const mockBreaks = [
    {
      breakid: 1,
      shiftid: 1,
      breakstart: "09:00",
      breakend: "09:15",
      breakdescription: "Morning Break",
    },
    {
      breakid: 2,
      shiftid: 1,
      breakstart: "12:00",
      breakend: "12:30",
      breakdescription: "Lunch Break",
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    getConnection.mockResolvedValue(mockPool);
    mockPool.query.mockReset();
    mockPool.execute.mockReset();
  });

  describe("getShifts", () => {
    it("should retrieve all shifts ordered by shiftid", async () => {
      mockPool.query.mockResolvedValueOnce({ recordset: mockShifts });

      const result = await getShifts();

      expect(result).toEqual(mockShifts);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM dbo.sop_shifts")
      );
    });

    it("should handle database errors", async () => {
      mockPool.query.mockRejectedValueOnce(new Error("Database error"));

      await expect(getShifts()).rejects.toThrow("Database error");
    });
  });

  describe("getShiftBreaks", () => {
    it("should retrieve all shift breaks ordered by shiftid and breakstart", async () => {
      mockPool.query.mockResolvedValueOnce({ recordset: mockBreaks });

      const result = await getShiftBreaks();

      expect(result).toEqual(mockBreaks);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM dbo.sop_shiftbreaks")
      );
    });
  });

  describe("updateShiftBreak", () => {
    it("should insert a new shift break successfully", async () => {
      const breakData = {
        shiftid: 1,
        breakstart: "09:00",
        breakend: "09:15",
        breakdescription: "New Break",
      };

      await updateShiftBreak(
        breakData.shiftid,
        breakData.breakstart,
        breakData.breakend,
        breakData.breakdescription
      );

      expect(mockPool.request().input).toHaveBeenCalledWith(
        "shiftid",
        breakData.shiftid
      );
      expect(mockPool.request().input).toHaveBeenCalledWith(
        "breakstart",
        breakData.breakstart
      );
      expect(mockPool.request().input).toHaveBeenCalledWith(
        "breakend",
        breakData.breakend
      );
      expect(mockPool.request().input).toHaveBeenCalledWith(
        "breakdescription",
        breakData.breakdescription
      );
    });
  });

  describe("deleteShiftBreak", () => {
    it("should delete a shift break by breakid", async () => {
      const breakid = 1;

      await deleteShiftBreak(breakid);

      expect(mockPool.request().input).toHaveBeenCalledWith("breakid", breakid);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "DELETE FROM EV_BPA_DEV_MAINLINE.dbo.sop_shiftbreaks"
        )
      );
    });
  });

  describe("getShiftSchedules", () => {
    it("should retrieve shift schedules for the last 10 days", async () => {
      const mockSchedules = [
        { scheduleid: 1, scheduledate: "2024-03-01", shiftid: 1 },
      ];
      mockPool.query.mockResolvedValueOnce({ recordset: mockSchedules });

      const result = await getShiftSchedules();

      expect(result).toEqual(mockSchedules);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WITH LatestDate")
      );
    });
  });

  describe("scheduleShifts", () => {
    it("should schedule shifts for specific dates, zones and shifts", async () => {
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const zones = ["Zone1"];
      const shifts = ["Morning"];

      const mockAssets = [
        { assetid: 1, machineshortname: "M1", zone: "Zone1", isbottleneck: 1 },
      ];

      mockPool.query
        .mockResolvedValueOnce({ recordset: [{ shiftid: 1 }] }) // Shift query
        .mockResolvedValueOnce({ recordset: mockAssets }) // Assets query
        .mockResolvedValue({ rowsAffected: [1] }); // Insert queries

      await scheduleShifts(dateRange, zones, shifts);

      expect(mockPool.request().input).toHaveBeenCalledWith(
        "scheduledate",
        expect.any(String)
      );
      expect(mockPool.request().input).toHaveBeenCalledWith(
        "shiftid",
        expect.any(Number)
      );
    });

    it('should handle "all" zones and shifts', async () => {
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-01", // Single day for simpler test
        },
      ];
      const zones = ["all"];
      const shifts = ["all"];

      const mockAssets = [
        { assetid: 1, machineshortname: "M1", zone: "Zone1", isbottleneck: 1 },
        { assetid: 2, machineshortname: "M2", zone: "Zone2", isbottleneck: 1 },
      ];

      mockPool.query
        .mockResolvedValueOnce({ recordset: mockShifts }) // All shifts
        .mockResolvedValueOnce({ recordset: mockAssets }) // All assets
        .mockResolvedValue({ rowsAffected: [1] }); // Insert queries

      await scheduleShifts(dateRange, zones, shifts);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT shiftid FROM EV_BPA_DEV_MAINLINE.dbo.sop_shifts"
        )
      );
    });
  });

  describe("getExistingSchedules", () => {
    it("should check for existing schedules in date range", async () => {
      const dateRange = [
        {
          startDate: "2024-03-01",
          endDate: "2024-03-07",
        },
      ];
      const zones = ["Zone1"];
      const shifts = ["Morning"];

      const mockResult = {
        recordset: [
          {
            DateExists: true,
            ExistingZones: '["Zone1"]',
            ExistingShifts: '["Morning"]',
            ExistingDates: '[{"date":"2024-03-01"}]',
          },
        ],
      };

      mockPool.execute.mockResolvedValueOnce(mockResult);

      const result = await getExistingSchedules(dateRange, zones, shifts);

      expect(result.DateExists).toBe(true);
      expect(result.ExistingZones).toEqual(["Zone1"]);
      expect(result.ExistingShifts).toEqual(["Morning"]);
      expect(result.ExistingDates).toEqual(["2024-03-01"]);
    });
  });

  describe("createShiftHighlights", () => {
    it("should create shift highlights with current shift", async () => {
      const reason = "Important highlight";

      mockPool.query
        .mockResolvedValueOnce({ recordset: [{ shiftid: 1 }] }) // getCurrentShiftId
        .mockResolvedValueOnce({ rowsAffected: [1] }); // Insert

      await createShiftHighlights(reason);

      expect(mockPool.request().input).toHaveBeenCalledWith(
        "shift_highlights_details",
        String(reason)
      );
      expect(mockPool.request().input).toHaveBeenCalledWith("shift_id", 1);
    });
  });

  describe("getShiftHighlights", () => {
    it("should retrieve the most recent shift highlight", async () => {
      const mockHighlight = {
        shift_highlights_id: 1,
        highlights_date: new Date(),
        shift_highlights_details: "Important note",
        shift_id: 1,
      };

      mockPool.query.mockResolvedValueOnce({ recordset: [mockHighlight] });

      const result = await getShiftHighlights();

      expect(result).toEqual([mockHighlight]);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT TOP 1 * FROM shift_highlights")
      );
    });
  });
});

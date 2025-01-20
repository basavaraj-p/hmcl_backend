const sql = require("mssql");
const {
  getWeeklymaintenancebyZone,
  getWeeklymaintenancebyMachine,
} = require("../../v1/Services/sopWeeklymaintenanceService");

// Mock the database connection and sql module
jest.mock("mssql");
jest.mock("../../v1/Database/dbConfig", () => ({
  getConnection: jest.fn(),
}));

// Mock data
const mockRecordset = [
  {
    date: "2024-01-01",
    zone: "3.1",
    bdminutes: 100,
    bdnumbers: 5,
    uptime: 95,
    availabletime: 480,
    mttr: 20,
    mtbf: 240,
  },
  {
    date: "2024-01-10",
    zone: "3.1",
    bdminutes: 120,
    bdnumbers: 6,
    uptime: 93,
    availabletime: 480,
    mttr: 25,
    mtbf: 220,
  },
  {
    date: "2024-01-18",
    zone: "3.1",
    bdminutes: 90,
    bdnumbers: 4,
    uptime: 96,
    availabletime: 480,
    mttr: 18,
    mtbf: 260,
  },
  {
    date: "2024-01-25",
    zone: "3.1",
    bdminutes: 110,
    bdnumbers: 5,
    uptime: 94,
    availabletime: 480,
    mttr: 22,
    mtbf: 230,
  },
];

describe("Maintenance Service Tests", () => {
  let mockPool;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock pool
    mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: mockRecordset }),
    };

    require("../../v1/Database/dbConfig").getConnection.mockResolvedValue(
      mockPool
    );
  });

  describe("getWeeklymaintenancebyZone", () => {
    it("should fetch and calculate weekly maintenance metrics by zone", async () => {
      const result = await getWeeklymaintenancebyZone("3.1", 0); // January (0-based month)

      // Verify the function called the database with correct parameters
      expect(mockPool.input).toHaveBeenCalledWith("zone", "3.1");
      expect(mockPool.input).toHaveBeenCalledWith("month", 1);

      // Verify the structure of the returned data
      expect(result).toHaveProperty("bdMinutes");
      expect(result).toHaveProperty("bdNumbers");
      expect(result).toHaveProperty("upTimeVariable");
      expect(result).toHaveProperty("upTimeConstant");
      expect(result).toHaveProperty("mttr");
      expect(result).toHaveProperty("mtbf");

      // Verify calculations for one metric
      expect(result.bdMinutes[0]).toHaveProperty("monthAvg");
      expect(result.bdMinutes[0]).toHaveProperty("w1");
      expect(result.bdMinutes[0]).toHaveProperty("w2");
      expect(result.bdMinutes[0]).toHaveProperty("w3");
      expect(result.bdMinutes[0]).toHaveProperty("w4");

      // Verify the monthly average calculation
      expect(result.bdMinutes[0].monthAvg).toBe(105); // (100 + 120 + 90 + 110) / 4
    });

    it("should handle database errors gracefully", async () => {
      mockPool.query.mockRejectedValue(new Error("Database error"));

      await expect(getWeeklymaintenancebyZone("3.1", 0)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getWeeklymaintenancebyMachine", () => {
    it("should fetch and calculate weekly maintenance metrics by machine", async () => {
      const result = await getWeeklymaintenancebyMachine("3.1", 0, "BMS");

      // Verify the function called the database with correct parameters
      expect(mockPool.input).toHaveBeenCalledWith("zone", "3.1");
      expect(mockPool.input).toHaveBeenCalledWith("month", 1);
      expect(mockPool.input).toHaveBeenCalledWith("machine", "BMS");

      // Verify the structure of the returned data
      expect(result).toHaveProperty("bdMinutes");
      expect(result).toHaveProperty("bdNumbers");
      expect(result).toHaveProperty("upTimeVariable");
      expect(result).toHaveProperty("upTimeConstant");
      expect(result).toHaveProperty("mttr");
      expect(result).toHaveProperty("mtbf");

      // Verify calculations for uptime
      expect(result.upTimeVariable[0].monthAvg).toBe(94.5); // (95 + 93 + 96 + 94) / 4
    });

    it("should handle empty result sets", async () => {
      mockPool.query.mockResolvedValue({ recordset: [] });

      const result = await getWeeklymaintenancebyMachine("3.1", 0, "BMS");

      // Verify that all metrics have zero values when no data is present
      expect(result.bdMinutes[0].monthAvg).toBe(0);
      expect(result.bdNumbers[0].monthAvg).toBe(0);
      expect(result.upTimeVariable[0].monthAvg).toBe(0);
      expect(result.upTimeConstant).toBe(0);
      expect(result.mttr[0].monthAvg).toBe(0);
      expect(result.mtbf[0].monthAvg).toBe(0);
    });

    it("should handle database errors gracefully", async () => {
      mockPool.query.mockRejectedValue(new Error("Database error"));

      await expect(
        getWeeklymaintenancebyMachine("3.1", 0, "BMS")
      ).rejects.toThrow("Database error");
    });
  });
});

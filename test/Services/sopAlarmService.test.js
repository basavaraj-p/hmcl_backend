// database-services.test.js
const {
  getRowCount,
  getLatestAlarms,
  getTodayRowCount,
} = require("../../v1/Services/sopAlarmService");
const { getConnection } = require("../../v1/Database/dbConfig");

// Mock the database module
jest.mock("../../v1/Database/dbConfig");

describe("Database Services", () => {
  // Setup common mock implementation
  const mockPool = {
    request: jest.fn().mockReturnThis(),
    input: jest.fn().mockReturnThis(),
    query: jest.fn(),
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Setup default mock implementation for getConnection
    getConnection.mockResolvedValue(mockPool);
  });

  describe("getRowCount", () => {
    it("should return the correct count of rows", async () => {
      // Arrange
      const expectedCount = 42;
      mockPool.query.mockResolvedValueOnce({
        recordset: [{ count: expectedCount }],
      });

      // Act
      const result = await getRowCount();

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT COUNT(*) as count FROM dbo.sop_alarm"
      );
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(getRowCount()).rejects.toThrow(expectedError);
    });
  });

  describe("getLatestAlarms", () => {
    it("should return latest alarms with default limit", async () => {
      // Arrange
      const mockAlarms = [
        { id: 1, time: "2024-01-01" },
        { id: 2, time: "2024-01-02" },
      ];
      mockPool.query.mockResolvedValueOnce({ recordset: mockAlarms });

      // Act
      const result = await getLatestAlarms();

      // Assert
      expect(result).toEqual(mockAlarms);
      expect(mockPool.input).toHaveBeenCalledWith("limit", 10);
      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT TOP (@limit) * FROM dbo.sop_alarm ORDER BY [time] DESC"
      );
    });

    it("should return latest alarms with custom limit", async () => {
      // Arrange
      const customLimit = 5;
      const mockAlarms = [{ id: 1, time: "2024-01-01" }];
      mockPool.query.mockResolvedValueOnce({ recordset: mockAlarms });

      // Act
      const result = await getLatestAlarms(customLimit);

      // Assert
      expect(result).toEqual(mockAlarms);
      expect(mockPool.input).toHaveBeenCalledWith("limit", customLimit);
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(getLatestAlarms()).rejects.toThrow(expectedError);
    });
  });

  describe("getTodayRowCount", () => {
    it("should return count of today's rows", async () => {
      // Arrange
      const expectedCount = 15;
      mockPool.query.mockResolvedValueOnce({
        recordset: [{ count: expectedCount }],
      });

      // Act
      const result = await getTodayRowCount();

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*) as count")
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("CAST(GETDATE() AS DATE)")
      );
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(getTodayRowCount()).rejects.toThrow(expectedError);
    });
  });
});

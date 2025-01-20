// cycletime-services.test.js
const {
  getCycletimes,
  getCycletimes2,
  updateCycletime,
  getFilteredCycletimes,
} = require("../../v1/Services/sopCycletimeService");
const { getConnection } = require("../../v1/Database/dbConfig");

// Mock the database module
jest.mock("../../v1/Database/dbConfig");

describe("Cycletime Database Services", () => {
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

  describe("getCycletimes", () => {
    it("should return bottleneck assets data", async () => {
      // Arrange
      const mockData = [
        {
          machineshortname: "Machine1",
          zone: "Zone1",
          cycletime: 3.5,
          assetid: 1,
          machinename: "Machine One",
        },
        {
          machineshortname: "Machine2",
          zone: "Zone2",
          cycletime: 4.0,
          assetid: 2,
          machinename: "Machine Two",
        },
      ];
      mockPool.query.mockResolvedValueOnce({ recordset: mockData });

      // Act
      const result = await getCycletimes();

      // Assert
      expect(result).toEqual(mockData);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "select machineshortname,[zone],cycletime,assetid,machinename"
        )
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("where isbottleneck=1")
      );
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(getCycletimes()).rejects.toThrow(expectedError);
    });
  });

  describe("getCycletimes2", () => {
    it("should return distinct machine names and zones", async () => {
      // Arrange
      const mockData = [
        { machinename: "Machine1", zone: "Zone1" },
        { machinename: "Machine2", zone: "Zone2" },
      ];
      mockPool.query.mockResolvedValueOnce({ recordsets: [mockData] });

      // Act
      const result = await getCycletimes2();

      // Assert
      expect(result).toEqual(mockData);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT DISTINCT machinename, [zone]")
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY [zone] ASC")
      );
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(getCycletimes2()).rejects.toThrow(expectedError);
    });
  });

  describe("updateCycletime", () => {
    it("should successfully update cycletime for a machine", async () => {
      // Arrange
      const machineshortname = "Machine1";
      const cycletime = 4.5;
      mockPool.query.mockResolvedValueOnce({ rowsAffected: [1] });

      // Act
      await updateCycletime(machineshortname, cycletime);

      // Assert
      expect(mockPool.input).toHaveBeenCalledWith("cycletime", cycletime);
      expect(mockPool.input).toHaveBeenCalledWith(
        "machineshortname",
        machineshortname
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE EV_BPA_DEV_MAINLINE.dbo.sop_assets")
      );
    });

    it("should throw error when update fails", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(updateCycletime("Machine1", 4.5)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe("getFilteredCycletimes", () => {
    it("should return filtered cycletimes data", async () => {
      // Arrange
      const startDate = "2024-01-01";
      const endDate = "2024-01-02";
      const mockData = [
        {
          machinename: "Machine1",
          cycletime: 3.5,
          timestamp: "2024-01-01T12:00:00",
        },
      ];
      mockPool.query.mockResolvedValueOnce({ recordset: mockData });

      // Act
      const result = await getFilteredCycletimes(startDate, endDate);

      // Assert
      expect(result).toEqual(mockData);
      expect(mockPool.input).toHaveBeenCalledWith("startDate", startDate);
      expect(mockPool.input).toHaveBeenCalledWith("endDate", endDate);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("GetFilteredCycletimes")
      );
    });

    it("should throw error when filter query fails", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(
        getFilteredCycletimes("2024-01-01", "2024-01-02")
      ).rejects.toThrow(expectedError);
    });

    it("should handle empty result set", async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({ recordset: [] });

      // Act
      const result = await getFilteredCycletimes("2024-01-01", "2024-01-02");

      // Assert
      expect(result).toEqual([]);
    });
  });
});

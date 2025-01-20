// rejection-services.test.js
const {
  fetchDefects,
  createRejectionRework,
  fetchRejectionReworks,
  fetchAssets,
  checkBarcodes,
} = require("../../v1/Services/sopRejectionReworkService");
const { getConnection } = require("../../v1/Database/dbConfig");
const { getConnection2 } = require("../../v1/Database/dbConfig2");
const sql = require("mssql");

// Mock the database modules
jest.mock("../../v1/Database/dbConfig");
jest.mock("../../v1/Database/dbConfig2");
jest.mock("mssql");

describe("Rejection Database Services", () => {
  // Setup common mock implementations
  const mockPool = {
    request: jest.fn().mockReturnThis(),
    input: jest.fn().mockReturnThis(),
    query: jest.fn(),
    execute: jest.fn(),
    close: jest.fn(),
    config: {
      server: "test-server",
      database: "test-db",
      user: "test-user",
    },
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Setup default mock implementations
    getConnection.mockResolvedValue(mockPool);
    getConnection2.mockResolvedValue(mockPool);
  });

  describe("fetchDefects", () => {
    it("should fetch defects successfully", async () => {
      // Arrange
      const mockDefects = [
        { id: 1, code: "DEF1", description: "Defect 1" },
        { id: 2, code: "DEF2", description: "Defect 2" },
      ];
      mockPool.query.mockResolvedValueOnce({ recordset: mockDefects });

      // Act
      const result = await fetchDefects();

      // Assert
      expect(result).toEqual(mockDefects);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "select * from EV_BPA_DEV_MAINLINE.dbo.sop_defect_lookup"
        )
      );
      expect(mockPool.close).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Arrange
      const expectedError = new Error("Database error");
      mockPool.query.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(fetchDefects()).rejects.toThrow(expectedError);
      expect(mockPool.close).toHaveBeenCalled();
    });
  });

  describe("createRejectionRework", () => {
    const mockInput = {
      adid: "USER1",
      barcodes: ["BARCODE1", "BARCODE2"],
      machine: "Welding integrity",
      defectType: "TYPE1",
      defectCodes: ["DEF1", "DEF2"],
      reason: "Test reason",
    };

    it("should create rejection rework successfully", async () => {
      // Arrange
      const mockAssetResult = {
        AssetID: 123,
        Zone: "1.0",
      };
      const mockShiftResult = {
        recordset: [{ shiftid: 1 }],
      };

      mockPool.query
        .mockResolvedValueOnce(mockShiftResult) // for shift query
        .mockResolvedValueOnce({ rowsAffected: [1] }); // for insert query

      mockPool.execute.mockResolvedValueOnce({ recordset: [mockAssetResult] });

      // Act
      const result = await createRejectionRework(
        mockInput.adid,
        mockInput.barcodes,
        mockInput.machine,
        mockInput.defectType,
        mockInput.defectCodes,
        mockInput.reason
      );

      // Assert
      expect(result.message).toBe("Operation completed");
      expect(result.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            barcode: expect.any(String),
            status: "success",
          }),
        ])
      );
    });

    it("should handle missing AssetID", async () => {
      // Arrange
      mockPool.execute.mockResolvedValueOnce({
        recordset: [{ AssetID: null }],
      });

      // Act
      const result = await createRejectionRework(
        mockInput.adid,
        [mockInput.barcodes[0]],
        mockInput.machine,
        mockInput.defectType,
        mockInput.defectCodes,
        mockInput.reason
      );

      // Assert
      expect(result.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: "failed",
            reason: "AssetID not found",
          }),
        ])
      );
    });
  });

  describe("fetchRejectionReworks", () => {
    it("should fetch recent rejection reworks", async () => {
      // Arrange
      const mockRejections = [
        { id: 1, datetime: new Date(), barcode: "BARCODE1" },
        { id: 2, datetime: new Date(), barcode: "BARCODE2" },
      ];
      mockPool.query.mockResolvedValueOnce({ recordset: mockRejections });

      // Act
      const result = await fetchRejectionReworks();

      // Assert
      expect(result).toEqual(mockRejections);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT * FROM EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework"
        )
      );
      expect(mockPool.close).toHaveBeenCalled();
    });
  });

  describe("fetchAssets", () => {
    it("should fetch assets successfully", async () => {
      // Arrange
      const mockAssets = [
        { assetid: 1, machinename: "Machine1", zone: "1.0" },
        { assetid: 2, machinename: "Machine2", zone: "2.0" },
      ];
      mockPool.query.mockResolvedValueOnce({ recordset: mockAssets });

      // Act
      const result = await fetchAssets();

      // Assert
      expect(result).toEqual(mockAssets);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "select assetid,machinename,[zone] from sop_assets"
        )
      );
      expect(mockPool.close).toHaveBeenCalled();
    });
  });

  describe("checkBarcodes", () => {
    it("should check barcodes and return asset IDs", async () => {
      // Arrange
      const mockBarcodes = ["BARCODE1", "BARCODE2"];
      const mockMachine = "Welding integrity";
      const mockAssetResults = [{ AssetID: 123 }, { AssetID: 456 }];

      mockPool.execute.mockResolvedValue({ recordset: [mockAssetResults[0]] });
      mockPool.execute.mockResolvedValueOnce({
        recordset: [mockAssetResults[1]],
      });

      // Act
      const result = await checkBarcodes(mockBarcodes, mockMachine);

      // Assert
      expect(result).toEqual([
        { barcode: mockBarcodes[0], assetId: mockAssetResults[0].AssetID },
        { barcode: mockBarcodes[1], assetId: mockAssetResults[1].AssetID },
      ]);
    });

    it("should handle errors during barcode checking", async () => {
      // Arrange
      const mockBarcodes = ["BARCODE1"];
      const mockMachine = "Welding integrity";
      const expectedError = new Error("Database error");
      mockPool.execute.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(checkBarcodes(mockBarcodes, mockMachine)).rejects.toThrow(
        expectedError
      );
    });
  });
});

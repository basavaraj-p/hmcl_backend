const express = require("express");
const cors = require("cors");
const sopStopageReasonRoutes = require("./mock/Routes/sopStopageReasonRoutes");
const sopAlarmRoutes = require("./mock/Routes/sopAlarmRoutes");
const sopCycletimeRoutes = require("./mock/Routes/sopCycletimeRoutes");
const sopShiftsRoutes = require("./mock/Routes/sopShiftsRoutes");
const sopShiftHistoryRoutes = require("./mock/Routes/sopShiftHistoryRoutes");
// const sopRejectionRoutes = require("./v1/Routes/sopRejectionRoutes");
const sopRejectionReworkRoutes = require("./mock/Routes/sopRejectionReworkRoutes");
// const bdRoutes = require("./v1/Routes/bdRoute");
// const leakTestRoute = require("./v1/Routes/leakTestRoute")
// const defectLookupRoute = require("./v1/Routes/sopDefectLookupRoute")
const sopWeeklymaintenanceRoutes = require("./mock/Routes/sopWeeklymaintenanceRoutes");
const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

app.use("/api/v1", sopStopageReasonRoutes);
app.use("/api/v1", sopAlarmRoutes);
app.use("/api/v1", sopCycletimeRoutes);
app.use("/api/v1", sopShiftsRoutes);
app.use("/api/v1", sopShiftHistoryRoutes);
// app.use("/api/v1", sopRejectionRoutes);
app.use("/api/v1", sopRejectionReworkRoutes);
// app.use("/api/v1", bdRoutes);
// app.use("/api/v1", leakTestRoute);
// app.use("/api/v1", defectLookupRoute);
app.use("/api/v1", sopWeeklymaintenanceRoutes);

app.listen(PORT, () => {
  console.log(`🚀🚀🚀🚀 Server is running on port ${PORT} 🚀🚀🚀🚀`);
});

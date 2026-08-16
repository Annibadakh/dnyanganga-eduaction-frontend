// CENTRAL ROLE REGISTRY (frontend mirror of Backend/utils/roleArrays.js)
// Single source of truth for role strings + access combos used in routing/UI.

// --- the role strings ---
export const admin = "admin";
export const subAdmin = "sub-admin";
export const counsellor = "counsellor";
export const teacher = "teacher";
export const logistics = "logistics";
export const followUp = "followUp";
export const student = "student";
export const ca = "ca";

// --- groups ---
export const allRoles = [admin, subAdmin, counsellor, teacher, logistics, followUp, student, ca];
export const staffRoles = [admin, subAdmin, counsellor, teacher, logistics, followUp, ca];

export const adminRole = [admin];
export const subAdminRole = [subAdmin];
export const counsellorRole = [counsellor];
export const teacherRole = [teacher];
export const logisticsRole = [logistics];
export const followUpRole = [followUp];
export const studentRole = [student];
export const caRole = [ca];

export const counsellorLikeRoles = [counsellor, subAdmin];

// Follow-up system (log entries against students or visitings)
export const followupAccess = [admin, subAdmin, counsellor, followUp];

// Roles that land on the generic Home page (CA goes to its own single section)
export const homeAccess = [admin, subAdmin, counsellor, teacher, logistics, followUp];

// --- access combos ---
export const adminControlsAccess = [admin];
export const regFormAccess = [counsellor, subAdmin, admin];
export const registrationTableAccess = [counsellor, subAdmin, admin, followUp];
export const filteredRegisterAccess = [admin, subAdmin];
export const studentStatisticsAccess = [admin, subAdmin, counsellor];
export const paymentWriteAccess = [counsellor, subAdmin];
export const paymentTableAccess = [admin, subAdmin, counsellor];
export const paymentExportAccess = [admin, subAdmin, counsellor];
export const studentByCounsellorAccess = [admin, subAdmin, counsellor];
export const visitingFormAccess = [counsellor, subAdmin];
export const visitingTableAccess = [counsellor, subAdmin, admin, followUp];
export const visitingEditAccess = [counsellor, subAdmin, admin, followUp];
export const visitingExportAccess = [admin, subAdmin, counsellor, followUp];
export const visitingFollowUpAccess = [admin, followUp];
export const studentReadAccess = [admin, subAdmin, counsellor];
export const studentUpdateAccess = [admin, subAdmin, counsellor];
export const studentDeleteAccess = [admin];
export const collectionAccess = [admin, subAdmin, counsellor];
export const collectionManageAccess = [admin];
export const collectionSettleAccess = [admin, subAdmin, counsellor];
export const challanAccess = [admin, subAdmin, counsellor, logistics];
export const challanDetailAccess = [admin, subAdmin, logistics];
export const challanByCounsellorAccess = [admin, subAdmin, logistics];
export const bookEntryAccess = [admin, logistics];
export const bookDetailsAccess = [admin, subAdmin, counsellor, logistics];
export const bookConfirmAccess = [admin, counsellor];
export const bookReceiverReceiptAccess = [counsellor, subAdmin];
export const reportAccess = [admin, subAdmin, counsellor];
export const marksAccess = [admin, teacher];
export const questionBankManageAccess = [admin, teacher];
export const questionBankAccess = [admin, teacher, student];
export const quizManageAccess = [admin];
export const quizReadAccess = [admin, subAdmin, counsellor, student];
export const quizDashboardAccess = [student, admin, subAdmin, counsellor, followUp];
export const quizAnalyticsAccess = [admin, subAdmin, counsellor];
export const studentPdfAccess = [admin, subAdmin, counsellor, ca];
export const bulkPdfAccess = [admin];
export const caAccess = [ca];
export const userListAccess = [admin, subAdmin, logistics, followUp];
export const userManageAccess = [admin];
export const examCenterReadAccess = [admin, subAdmin, counsellor, followUp];
export const examCenterManageAccess = [admin];

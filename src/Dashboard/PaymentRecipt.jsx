import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo from "../Images/logo4.png"; // Update with your actual logo path

const styles = StyleSheet.create({
  page: { padding: 20, lineHeight: 1 },
  header: { textAlign: "center", marginBottom: 20, flexDirection: "row", gap: 10 },
  logo: { width: 100, height: 60, marginBottom: 10 },
  section: { marginBottom: 10, textAlign: "left" },
  text: { fontSize: 12 },
  signature: { marginTop: 40, textAlign: "right", fontSize: 12, fontWeight: "bold" },

  // Table Styles
  table: { display: "table", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000", marginTop: 10 },
  tableRow: { flexDirection: "row" },
  tableHeader: { backgroundColor: "#ddd", fontWeight: "bold" },
  tableCell: { flex: 1, borderWidth: 1, borderColor: "#000", padding: 5, textAlign: "center", fontSize: 12 },
});

const PaymentReceipt = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={logo} style={styles.logo} />
        <View style={{ width: "400px", textAlign: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Dnyanganga Education Pvt. Ltd</Text>
          <Text style={styles.text}>Kopargaon -423601</Text>
          <Text style={styles.text}>Contact: +91 8767809061</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tableRow}>
          <Text style={styles.text}>Date: {new Date(data.payments[0].createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Student Details</Text>
          <Text style={styles.text}>Name: {data.studentName}</Text>
          <Text style={styles.text}>Contact No: {data.studentNo}</Text>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Payment Summary</Text>
          <Text style={styles.text}>Total Amount: {parseInt(data.amountPaid) + parseInt(data.amountRemaining)} /-</Text>
          <Text style={styles.text}>Amount Paid: {data.amountPaid} /-</Text>
          <Text style={styles.text}>Amount Remaining: {data.amountRemaining} /-</Text>
          <Text style={styles.text}>Due Date: {new Date(data.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Payment Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Sr No.</Text>
          <Text style={styles.tableCell}>Payment Id</Text>
          <Text style={styles.tableCell}>Amount Paid</Text>
          <Text style={styles.tableCell}>Payment Mode</Text>
          <Text style={styles.tableCell}>Date</Text>
        </View>

        {/* Table Rows */}
        {data.payments.map((payment, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{index + 1}</Text>
            <Text style={styles.tableCell}>{payment.paymentId}</Text>
            <Text style={styles.tableCell}>{payment.amountPaid} /-</Text>
            <Text style={styles.tableCell}>{payment.paymentMode}</Text>
            <Text style={styles.tableCell}>{new Date(payment.createdAt).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>

      {/* Signature */}
      <View>
        <Text style={styles.signature}>Authorized Signature</Text>
      </View>
    </Page>
  </Document>
);

export default PaymentReceipt;

import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo from "../Images/logo4.png"; // Update with your actual logo path

const styles = StyleSheet.create({
  page: { padding: 20, lineHeight: 1 },
  header: { textAlign: "center", marginBottom: 20, flexDirection:"row", gap: 10},
  logo: { width: 100, height: 60, marginBottom: 10 },
  section: { marginBottom: 10 ,textAlign:"left" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  text: { fontSize: 12 },
  signature: { marginTop: 40, textAlign: "right", fontSize: 12, fontWeight: "bold" },
});

const PaymentReceipt = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={logo} style={styles.logo} />
        <View style={{width: "400", textAlign:"center"}}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Dnyanganga Education Pvt. Ltd</Text>
          <Text style={styles.text}>Kopargaon -423601</Text>
          <Text style={styles.text}>Contact: +91 8767809061</Text>
        </View>
      </View>

      {/* Receipt Details */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.text}>Date: {new Date(data.payment.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.text}>Receipt No: {data.payment.paymentId}</Text>
        </View>
      </View>

      <View style={{flexDirection:"row", justifyContent:"space-between"}}>
          {/* Student Details */}
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Student Details</Text>
          <Text style={styles.text}>Name: {data.student.studentName}</Text>
          <Text style={styles.text}>Contact: {data.student.studentNo}</Text>
          <Text style={styles.text}>Address: {data.student.address}</Text>
          <Text style={styles.text}>Standard: {data.student.standard}</Text>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Payment Details</Text>
          
            <Text style={styles.text}>Total Amount: {parseInt(data.student.amountPaid) + parseInt(data.student.amountRemaining)} /-</Text>
            <Text style={styles.text}>Amount Paid: {data.payment.amountPaid} /-</Text>
          
          
            <Text style={styles.text}>Amount Remaining: {data.student.amountRemaining} /-</Text>
            <Text style={styles.text}>Payment Mode: {data.payment.paymentMode}</Text>
          
          <Text style={styles.text}>Due Date: {new Date(data.student.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Signature */}
      <View>
        <Text style={styles.signature}>Authorized Signature</Text>
      </View>
    </Page>
  </Document>
);

export default PaymentReceipt;

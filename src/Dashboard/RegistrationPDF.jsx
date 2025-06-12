import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
    color: "#003366",
    fontWeight: "bold",
  },
  head: {
    fontSize: 14,
    marginBottom: 2,
    color: "#003366",
  },
  section: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 4,
    padding: 3,
    backgroundColor: "#e6f0ff",
    color: "#003366",
    borderRadius: 3,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    fontSize: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 2,
  },
  label: {
    width: "35%",
    fontWeight: "bold",
  },
  value: {
    width: "65%",
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "grey",
  },
  photo: {
    width: 100,
    height: 100,
    border: "1px solid #ccc",
    alignSelf: "flex-end",
  },
  photo2: {
    width: 100,
    height: 100,
    border: "1px solid #ccc",
    alignSelf: "flex-start",
  },
  header: {
    flexDirection: "row",
    padding: 5,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
});

// Create Document Component
const RegistrationPDF = ({ data }) => {
    const imgUrl = import.meta.env.VITE_IMG_URL;

  const formatDate = (dateString) => (!dateString ? "N/A" : new Date(dateString).toLocaleDateString());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Student Registration Form</Text>
        
        <View style={styles.header}>
          {data.studentPhoto && <Image src={`${imgUrl}/uploads/logo.png`} style={styles.photo2} />}
          <View>
            <Text style={styles.head}>Student ID: {data.studentId || "N/A"}</Text>
            <Text style={styles.head}>Form No: {data.formNo || "N/A"}</Text>
            <Text style={styles.head}>Receipt No: {data.receiptNo || "N/A"}</Text>
            <Text style={styles.head}>Registration Date: {formatDate(data.createdAt)}</Text>
          </View>
          {data.studentPhoto && <Image src={`${imgUrl}${data.studentPhoto}`} style={styles.photo} />}
        </View>

        {["Personal Information", "Educational Information", "Address Information", "Payment Information"].map((section) => (
          <View key={section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section}</Text>
            {(
              {
                "Personal Information": [
                  ["Student Name", data.studentName],
                  ["Gender", data.gender],
                  ["DOB", formatDate(data.dob)],
                  ["Mother's Name", data.motherName],
                  ["Email", data.email],
                  ["Student Contact", data.studentNo],
                  ["Parents Contact", data.parentsNo],
                  ["Application No", data.appNo],
                ],
                "Educational Information": [
                  ["School/College", data.schoolCollege],
                  ["Standard", data.standard],
                  ["Branch", data.branch],
                  ["Exam Centre", data.examCentre],
                ],
                "Address Information": [["Address", data.address], ["Pincode", data.pincode]],
                "Payment Information": [
                  ["Amount Paid", `${data.amountPaid || 0}`],
                  ["Amount Remaining", `${data.amountRemaining || 0}`],
                  ["Due Date", formatDate(data.dueDate)],
                  ["Counsellor", data.counsellor],
                ],
              }[section]
            ).map(([label, value], index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{label}:</Text>
                <Text style={styles.value}>{value || "N/A"}</Text>
              </View>
            ))}
          </View>
        ))}
        
        <Text style={styles.footer}>Generated on {new Date().toLocaleDateString()} - Official Registration Form</Text>
      </Page>
    </Document>
  );
};

export default RegistrationPDF;
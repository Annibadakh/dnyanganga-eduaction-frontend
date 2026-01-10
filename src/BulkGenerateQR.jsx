import React, { useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

const bookPrefix = {
  Physics: "PHY",
  Chemistry: "CHE",
  Maths: "MAT",
  Biology: "BIO",
};

const BulkGenerateQR = () => {
  const [bookName, setBookName] = useState("");
  const [count, setCount] = useState(1);

  const generatePDF = async () => {
    if (!bookName || count <= 0) return;

    const pdf = new jsPDF("p", "mm", "a4");

    
    pdf.text(bookName, 90, 10);
    let x = 8;
    let y = 20;
    let col = 0;


    for (let i = 0; i < count; i++) {
      const bookId = `${Date.now()}${i + 1}`;
      const payload = JSON.stringify({ bookId, bookName });

      const qrImage = await QRCode.toDataURL(payload);

      pdf.addImage(qrImage, "PNG", x+7, y, 30, 30);
    //   pdf.text(bookName, x, y + 35);
      pdf.text(bookId, x, y + 35);

      col++;
      x += 50;

      if (col === 4) {
        col = 0;
        x = 10;
        y += 40;
      }

      if (y > 250) {
        pdf.addPage();
        y = 10;
      }
    }

    pdf.save(`${bookName}-QR-Codes.pdf`);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">
        Generate Book QR PDF
      </h2>

      <select
        value={bookName}
        onChange={(e) => setBookName(e.target.value)}
        className="border p-2 w-full mb-4"
      >
        <option value="">Select Book</option>
        <option value="Physics">Physics</option>
        <option value="Chemistry">Chemistry</option>
        <option value="Maths">Maths</option>
        <option value="Biology">Biology</option>
      </select>

      <input
        type="number"
        min="1"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        className="border p-2 w-full mb-4"
        placeholder="Number of books"
      />

      <button
        onClick={generatePDF}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Generate PDF
      </button>
    </div>
  );
};

export default BulkGenerateQR;

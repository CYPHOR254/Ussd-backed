// index.js

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Define mapping of phone numbers to meter numbers
const phoneToMeterMapping = {
  254759432206: {
    "Meter 1": "0421-5223-5655-7464",
    "Meter 2": "1234-5678-9015-6583",
  }, // Example mapping for phone number +1234567890
  254701720503: {
    "Meter 1": "1111-2222-3333-4444",
    "Meter 2": "5555-6666-7777-8888",
  }, // Example mapping for phone number +9876543210
};
app.post("/ussd", (req, res) => {
  const { phoneNumber } = req.body;

  if (phoneToMeterMapping[phoneNumber]) {
    const meterNumbers = [];
    const meters = phoneToMeterMapping[phoneNumber];
    for (const key in meters) {
      meterNumbers.push({
        label: meters[key],
        value: meters[key],
      });
    }
    // Send response with meter numbers and status code "00"
    res.json({
      MeterNumbers: meterNumbers,
      respCode: "00",
    });
  } else {
    // Send error response with status code "00"
    res.status(404).json({
      error: "Phone number not found",
      respCode: "01",
    });
  }
});

// Function to generate a random 16-digit token
function generateToken() {
  const tokenLength = 16;
  let token = "";
  for (let i = 0; i < tokenLength; i++) {
    token += Math.floor(Math.random() * 10); // Random digit between 0 and 9
  }
  return token;
}
app.post("/buy-token", (req, res) => {
  // Assuming the request body contains the amount of tokens to buy, meter number, and phone number
  const { amount, meterNumber, phoneNumber } = req.body;

  // Check if amount is a valid number
  if (isNaN(amount) || amount <= 0) {
    // If amount is not a valid number or is less than or equal to 0, return error response
    res.status(400).json({
      success: false,
      error:
        "Invalid amount. Please provide a valid positive number for the amount of tokens.",
      respCode: "01", // Assuming respCode 01 indicates an error
    });
    return;
  }

  // If amount is a valid number, proceed with the transaction
  // Simulate a successful purchase for demonstration purposes
  const purchaseSuccess = true; // Change to false for simulating unsuccessful purchase

  if (purchaseSuccess) {
    // Generate a random 16-digit token
    const token = generateToken();
    // Assuming successful purchase
    // Here you can integrate with your payment system or token generation logic
    const successMessage = `You have successfully bought Units of ksh${amount}. Your Token Number is ${token}`;
    res.json({
      success: true,
      message: successMessage,
      token: token,
      meterNumber: meterNumber, // Add meterNumber to the response
      phoneNumber: phoneNumber, // Add phoneNumber to the response
      respCode: "00", // Assuming respCode 00 indicates success
    });
  } else {
    // If purchase is unsuccessful, return error response
    res.status(500).json({
      success: false,
      error: "Transaction failed. Please try again later.",
      respCode: "01", // Assuming respCode 01 indicates an error
    });
  }
});

app.post("/meter-numbers", (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Check if phoneNumber is provided and exists in the mapping
    if (!phoneNumber || !phoneToMeterMapping[phoneNumber]) {
      return res.status(400).json({
        success: false,
        respCode: "01",
        message: "Invalid phone number provided",
      });
    }

    // Get meter numbers associated with the provided phone number
    const meterNumbersForPhone = phoneToMeterMapping[phoneNumber];

    // Format meter numbers for response
    const formattedMeterNumbers = Object.entries(meterNumbersForPhone).map(
      ([label, value]) => ({
        label: value,
        value: value, // Include the value property
      })
    );

    res.status(200).json({
      success: true,
      respCode: "00",
      data: formattedMeterNumbers,
      message: "Meter Numbers retrieved successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      respCode: "01",
      message: "Internal Server Error",
      success: false,
    });
  }
});

// Define mapping of phone numbers to meter numbers
const phoneToMeterMapping0 = {
  254759432206: {
    "0421-5223-5655-7464": "Meter 1",
    "1234-5678-9015-6583": "Meter 2",
  }, // Example mapping for phone number +1234567890
  254701720503: {
    "1111-2222-3333-4444": "Meter 1",
    "5555-6666-7777-8888": "Meter 2",
  }, // Example mapping for phone number +9876543210
};

app.post("/meter-numbers-and-mpesa", (req, res) => {
    try {
      const { meterNumber, phoneNumber } = req.body;
  
      console.log("Received Payload:", req.body);
  
      // Check if phoneNumber is provided and exists in the mapping
      if (!phoneNumber || !phoneToMeterMapping0[phoneNumber]) {
        console.log("Invalid phone number provided");
        return res.status(400).json({
          success: false,
          respCode: "01",
          message: "Invalid phone number provided",
        });
      }
  
      // Convert meterNumber to an array if it's a single string
      const meterNumbers = Array.isArray(meterNumber) ? meterNumber : [meterNumber];
  
      console.log("Meter Numbers:", meterNumbers);
  
      // Filter out meter numbers that are not associated with the provided phone number
      const validMeterNumbers = meterNumbers.filter((meterNumber) => {
        const metersForPhoneNumber = phoneToMeterMapping0[phoneNumber];
        return metersForPhoneNumber && metersForPhoneNumber[meterNumber];
      });
  
      console.log("Valid Meter Numbers:", validMeterNumbers);
  
      // Define hardcoded MPESA codes for each meter number
      const hardcodedMpesaCodes = {
        "0421-5223-5655-7464": ["CKJ55TJXFF", "GN00CJBV65", "FY05GIB05Y"],
        "1234-5678-9015-6583": ["MPESA2_Code1", "MPESA2_Code2", "MPESA2_Code3"],
        // Add more mappings for other meter numbers if needed
        "1111-2222-3333-4444": ["hvf05hfdk0", "obf056hjyd", "shf606gbk0"],
        "5555-6666-7777-8888": ["MPESA2_Code1", "MPESA2_Code2", "MPESA2_Code3"],
      };
  
      // Generate array of objects with label and value representing MPESA codes
      const data = validMeterNumbers.flatMap((meterNumber) => {
        const mpesaCodes = hardcodedMpesaCodes[meterNumber];
        if (!mpesaCodes) return [];
  
        return mpesaCodes.map((code) => ({
          label: code,
          value: code,
        }));
      });
  
      console.log("Final Data:", data);
  
      res.status(200).json({
        success: true,
        respCode: "00",
        data: data,
        message: "Meter Numbers and MPESA codes retrieved successfully",
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({
        respCode: "01",
        message: "Internal Server Error",
        success: false,
      });
    }
  });


  
  // Endpoint to generate message
  app.post('/generate-message', (req, res) => {
    try {
      const { meterNumber, reference, phoneNumber } = req.body;
  
      // Hardcoded token, amount, and units
      const token = '3449-7634-8091-0419-8054';
      const amount = '50.00'; // Hardcoded amount
      const units = '1.87'; // Hardcoded units
      const date = new Date().toISOString();
      // Construct the message
      const message = `END Mtr:${meterNumber}\nToken:${token}\nReference:${reference}\nPhone:${phoneNumber}\nDate:${getCurrentDate()}\nUnits:${units}\nAmt:${amount}\nTknAmt:22.94\nOtherCharges:27.06\nFor Details dial *977#`;
  
      // Return the message
      res.status(200).json({
        respCode: "00", 
        success: true,
        data: {
            shortMessage: `Your bill for electricity is `,
            units: units,
            tokenAmt: 22.89,
            reference: reference,
            Token: token,
            phoneNumber: phoneNumber,
            Date: date,
            amount:amount,
            OtherCharges:27.06,
            ForDetailsdial : "*977#"
          }     });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({
        respCode: "01",
         success: false,
         message: 'Internal Server Error'
         });
    }
  });
  
  // Function to get current date in the required format
  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day} ${hours}:${minutes}`;
  }
  

  
  
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

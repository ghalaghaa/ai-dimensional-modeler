WITH 
"Call_Account" AS 
    (
    SELECT
        "D1"."C0" AS "Account_Number", 
        "D1"."C1" AS "Account_Number_Internal", 
        "D1"."C2" AS "Currency_Code", 
        "D1"."C3" AS "Date_Account_Opened", 
        "D1"."C4" AS "Created_By", 
        "D1"."C5" AS "Branch_Number", 
        "D1"."C6" AS "Branch_Regional_Centre_Branch", 
        "D1"."C7" AS "Geographic_Region", 
        "D1"."C8" AS "Branch_Address_Line_3", 
        "D1"."C9" AS "Account_Type", 
        "D1"."C10" AS "Account_Basic_Number", 
        "D1"."C11" AS "Customer_Name", 
        "D1"."C12" AS "Customer_Type", 
        "D1"."C13" AS "Customer_Number_Internal", 
        "D1"."C14" AS "Customer_Default_Branch", 
        "D1"."C15" AS "Customer_Branch_Number", 
        "D1"."C16" AS "Days_MTD", 
        "D1"."C17" AS "Days_YTD", 
        SUM("D1"."C18") AS "Daily", 
        SUM("D1"."C19") AS "MTD", 
        SUM("D1"."C20") AS "YTD"
    FROM
        (
        SELECT
            "Account_Details"."Account_Number_External" AS "C0", 
            "Account_Details"."Account_Number" AS "C1", 
            "Account_Details"."Currency_Code" AS "C2", 
            "Account_Details"."Date_Account_Opened" AS "C3", 
            "Account_Details"."Created_By" AS "C4", 
            "Branch_Details"."Branch_Number" AS "C5", 
            "Branch_Details"."Branch_Regional_Centre_Branch" AS "C6", 
            "Branch_Details"."Branch_Level_4" AS "C7", 
            "Branch_Details"."Branch_Address_3" AS "C8", 
            "Account_Details"."Account_Type" AS "C9", 
            "Account_Details"."Account_Basic_Number_External" AS "C10", 
            "Customer"."Customer_Name" AS "C11", 
            "Customer"."Customer_Type" AS "C12", 
            "Customer"."Customer_Number" AS "C13", 
            "Customer_Additional_Detail_2"."Customer_Default_Branch" AS "C14", 
            "Customer"."Customer_Branch_Number" AS "C15", 
            DATEDIFF(DAY, DATEADD(DAY, -DAY(:P_Date:) + 1, :P_Date:), :P_Date:) + 1 AS "C16", 
            DATEDIFF(DAY, DATEADD(DAY, FLOOR((DATEPART(DAYOFYEAR, :P_Date:) - 1) * -1), :P_Date:), :P_Date:) + 1 AS "C17", 
            CASE 
                WHEN "Account_Daily_Balances"."Account_Balance_Date" = :P_Date: THEN "Account_Daily_Balances"."Balance_Last_Business_Day_Local" + "Account_Daily_Balances"."Shadow_Adjustment_Local"
                ELSE 0
            END AS "C18", 
            CASE 
                WHEN 
                    "Account_Daily_Balances"."Account_Balance_Date" >= DATEADD(DAY, -DAY(:P_Date:) + 1, :P_Date:) AND
                    "Account_Daily_Balances"."Account_Balance_Date" <= :P_Date:
                    THEN
                        "Account_Daily_Balances"."Balance_Last_Business_Day_Local" + "Account_Daily_Balances"."Shadow_Adjustment_Local"
                ELSE 0
            END AS "C19", 
            CASE 
                WHEN 
                    year("Account_Daily_Balances"."Account_Balance_Date") >= year(:P_Date:) AND
                    "Account_Daily_Balances"."Account_Balance_Date" <= :P_Date:
                    THEN
                        "Account_Daily_Balances"."Balance_Last_Business_Day_Local" + "Account_Daily_Balances"."Shadow_Adjustment_Local"
                ELSE 0
            END AS "C20"
        FROM
            "Equation_Presentation"."dbo"."D_Account" "Account_Details"
                INNER JOIN "Equation_Presentation"."dbo"."F_Account_Balance" "Account_Daily_Balances"
                ON "Account_Details"."Account_Number" = "Account_Daily_Balances"."Account_Number"
                    INNER JOIN "Equation_Presentation"."dbo"."D_Branch" "Branch_Details"
                    ON "Branch_Details"."Branch_Number" = "Account_Details"."Account_Branch"
                        FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                        ON "Account_Details"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Customer_Additional_Detail2" "Customer_Additional_Detail_2"
                            ON "Customer"."Customer_Number" = "Customer_Additional_Detail_2"."customer_Number" 
        WHERE 
            "Account_Details"."Account_Type" IN ( 
                'CB' ) AND
            year("Account_Daily_Balances"."Account_Balance_Date") = year(:P_Date:)
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3", 
        "D1"."C4", 
        "D1"."C5", 
        "D1"."C6", 
        "D1"."C7", 
        "D1"."C8", 
        "D1"."C9", 
        "D1"."C10", 
        "D1"."C11", 
        "D1"."C12", 
        "D1"."C13", 
        "D1"."C14", 
        "D1"."C15", 
        "D1"."C16", 
        "D1"."C17"
    ), 
"SQL2"("Account_Number", "Account_Branch", "Account_Basic_Number", "Account_Suffix", "Balance_Order_Type", "Funding_Or_Receiving", "Sequence_Number", "Funding_Receiving_Account_Number", "Funding_Receiving_Account_Branch", "Funding_Receiving_Account_Basic_Number", "Funding_Receiving_Account_Suffix", "Retail_Rate_Type", "Spot_User_Retail_Rate", "Funding_Account_Minimum_Balance", "Minimum_Balance_Increment_Amount", "Receiving_Account_Minimum_Transfer_Amount", "Maximum_Transfer_Amount", "Record_To_Be_Deleted", "Account_Unit", "Account_Server", "Account_Currency ") AS 
    (
    SELECT [Account_Number]
      ,[Account_Branch]
      ,[Account_Basic_Number]
      ,[Account_Suffix]
      ,[Balance_Order_Type]
      ,[Funding_Or_Receiving]
      ,[Sequence_Number]
      ,[Funding_Receiving_Account_Number]
      ,[Funding_Receiving_Account_Branch]
      ,[Funding_Receiving_Account_Basic_Number]
      ,[Funding_Receiving_Account_Suffix]
      ,[Retail_Rate_Type]
      ,[Spot_User_Retail_Rate]
      ,[Funding_Account_Minimum_Balance]
      ,[Minimum_Balance_Increment_Amount]
      ,[Receiving_Account_Minimum_Transfer_Amount]
      ,[Maximum_Transfer_Amount]
      ,[Record_To_Be_Deleted]
      ,[Account_Unit]
      ,[Account_Server]
      ,[Account_Currency ]
  FROM [dbo].[F_Funding_Minimum_Maximum_Amount]
    ), 
"Funding_Mini_or_Max" AS 
    (
    SELECT
        "SQL2"."Account_Number" AS "Account_Number", 
        "SQL2"."Account_Branch" AS "Account_Branch", 
        "SQL2"."Account_Basic_Number" AS "Account_Basic_Number", 
        "SQL2"."Account_Suffix" AS "Account_Suffix", 
        "SQL2"."Balance_Order_Type" AS "Balance_Order_Type", 
        "SQL2"."Funding_Or_Receiving" AS "Funding_Or_Receiving", 
        "SQL2"."Sequence_Number" AS "Sequence_Number", 
        "SQL2"."Funding_Receiving_Account_Number" AS "Funding_Receiving_Account_Number", 
        "SQL2"."Funding_Receiving_Account_Branch" AS "Funding_Receiving_Account_Branch", 
        "SQL2"."Funding_Receiving_Account_Basic_Number" AS "Funding_Receiving_Account_Basic_Number", 
        "SQL2"."Funding_Receiving_Account_Suffix" AS "Funding_Receiving_Account_Suffix", 
        "SQL2"."Retail_Rate_Type" AS "Retail_Rate_Type", 
        "SQL2"."Spot_User_Retail_Rate" AS "Spot_User_Retail_Rate", 
        "SQL2"."Funding_Account_Minimum_Balance" AS "Funding_Account_Minimum_Balance", 
        "SQL2"."Minimum_Balance_Increment_Amount" AS "Minimum_Balance_Increment_Amount", 
        "SQL2"."Receiving_Account_Minimum_Transfer_Amount" AS "Receiving_Account_Minimum_Transfer_Amount", 
        "SQL2"."Maximum_Transfer_Amount" AS "Maximum_Transfer_Amount", 
        "SQL2"."Record_To_Be_Deleted" AS "Record_To_Be_Deleted", 
        "SQL2"."Account_Unit" AS "Account_Unit", 
        "SQL2"."Account_Server" AS "Account_Server", 
        "SQL2"."Account_Currency " AS "Account_Currency_"
    FROM
        "SQL2" 
    WHERE 
        "SQL2"."Balance_Order_Type" = 'S' AND
        "SQL2"."Funding_Or_Receiving" = 'R' AND
        "SQL2"."Sequence_Number" = 1 
    GROUP BY 
        "SQL2"."Account_Number", 
        "SQL2"."Account_Branch", 
        "SQL2"."Account_Basic_Number", 
        "SQL2"."Account_Suffix", 
        "SQL2"."Balance_Order_Type", 
        "SQL2"."Funding_Or_Receiving", 
        "SQL2"."Sequence_Number", 
        "SQL2"."Funding_Receiving_Account_Number", 
        "SQL2"."Funding_Receiving_Account_Branch", 
        "SQL2"."Funding_Receiving_Account_Basic_Number", 
        "SQL2"."Funding_Receiving_Account_Suffix", 
        "SQL2"."Retail_Rate_Type", 
        "SQL2"."Spot_User_Retail_Rate", 
        "SQL2"."Funding_Account_Minimum_Balance", 
        "SQL2"."Minimum_Balance_Increment_Amount", 
        "SQL2"."Receiving_Account_Minimum_Transfer_Amount", 
        "SQL2"."Maximum_Transfer_Amount", 
        "SQL2"."Record_To_Be_Deleted", 
        "SQL2"."Account_Unit", 
        "SQL2"."Account_Server", 
        "SQL2"."Account_Currency "
    ), 
"SQL1"("Account_Number", "Actual_Rate_Credit", "Cr_int_Profit_Period_Start_Next_Business_Day") AS 
    (
    SELECT Account_Number,Actual_Rate_Credit,Cr_int_Profit_Period_Start_Next_Business_Day    
  FROM [dbo].[F_Interest_Status_Account] where Account_Type = 'CB'
    ), 
"Interest_Account" AS 
    (
    SELECT
        "SQL1"."Account_Number" AS "Account_Number", 
        "SQL1"."Actual_Rate_Credit" AS "Actual_Rate_Credit", 
        "SQL1"."Cr_int_Profit_Period_Start_Next_Business_Day" AS "Cr_int_Profit_Period_Start_Next_Business_Day"
    FROM
        "SQL1" 
    GROUP BY 
        "SQL1"."Account_Number", 
        "SQL1"."Actual_Rate_Credit", 
        "SQL1"."Cr_int_Profit_Period_Start_Next_Business_Day"
    ), 
"Call_Account_Min" AS 
    (
    SELECT
        "Call_Account"."Account_Number" AS "Account_Number", 
        "Call_Account"."Account_Number_Internal" AS "Account_Number_Internal", 
        "Call_Account"."Currency_Code" AS "Currency_Code", 
        "Call_Account"."Date_Account_Opened" AS "Date_Account_Opened", 
        "Call_Account"."Created_By" AS "Created_By", 
        "Funding_Mini_or_Max"."Receiving_Account_Minimum_Transfer_Amount" AS "Receiving_Account_Minimum_Transfer_Amount", 
        "Call_Account"."Branch_Number" AS "Branch_Number", 
        "Call_Account"."Branch_Regional_Centre_Branch" AS "Branch_Regional_Centre_Branch", 
        "Call_Account"."Geographic_Region" AS "Geographic_Region", 
        "Call_Account"."Branch_Address_Line_3" AS "Branch_Address_Line_3", 
        "Call_Account"."Account_Type" AS "Account_Type", 
        "Call_Account"."Account_Basic_Number" AS "Account_Basic_Number", 
        "Call_Account"."Customer_Name" AS "Customer_Name", 
        "Call_Account"."Customer_Number_Internal" AS "Customer_Number_Internal", 
        "Call_Account"."Customer_Type" AS "Customer_Type", 
        "Call_Account"."Customer_Default_Branch" AS "Customer_Default_Branch", 
        "Call_Account"."Customer_Branch_Number" AS "Customer_Branch_Number", 
        SUM("Call_Account"."Daily") AS "Daily", 
        SUM(CAST("Call_Account"."MTD" AS DOUBLE PRECISION) / NULLIF("Call_Account"."Days_MTD", 0)) AS "MTD", 
        SUM(CAST("Call_Account"."YTD" AS DOUBLE PRECISION) / NULLIF("Call_Account"."Days_YTD", 0)) AS "YTD"
    FROM
        "Call_Account"
            LEFT OUTER JOIN "Funding_Mini_or_Max"
            ON "Call_Account"."Account_Number_Internal" = "Funding_Mini_or_Max"."Account_Number" 
    GROUP BY 
        "Call_Account"."Account_Number", 
        "Call_Account"."Account_Number_Internal", 
        "Call_Account"."Currency_Code", 
        "Call_Account"."Date_Account_Opened", 
        "Call_Account"."Created_By", 
        "Funding_Mini_or_Max"."Receiving_Account_Minimum_Transfer_Amount", 
        "Call_Account"."Branch_Number", 
        "Call_Account"."Branch_Regional_Centre_Branch", 
        "Call_Account"."Geographic_Region", 
        "Call_Account"."Branch_Address_Line_3", 
        "Call_Account"."Account_Type", 
        "Call_Account"."Account_Basic_Number", 
        "Call_Account"."Customer_Name", 
        "Call_Account"."Customer_Number_Internal", 
        "Call_Account"."Customer_Type", 
        "Call_Account"."Customer_Default_Branch", 
        "Call_Account"."Customer_Branch_Number"
    )
SELECT
    "Call_Account_Min"."Account_Number" AS "Account_Number", 
    "Call_Account_Min"."Account_Number_Internal" AS "Account_Number_Internal", 
    "Call_Account_Min"."Currency_Code" AS "Currency_Code", 
    "Call_Account_Min"."Date_Account_Opened" AS "Date_Account_Opened", 
    "Call_Account_Min"."Created_By" AS "Created_By", 
    "Interest_Account"."Actual_Rate_Credit" AS "Actual_Rate_Credit", 
    "Interest_Account"."Cr_int_Profit_Period_Start_Next_Business_Day" AS "Cr_int_Profit_Period_Start_Next_Business_Day", 
    "Call_Account_Min"."Receiving_Account_Minimum_Transfer_Amount" AS "Minimum_Threshold_Balance", 
    "Call_Account_Min"."Branch_Number" AS "Branch_Number", 
    "Call_Account_Min"."Branch_Regional_Centre_Branch" AS "Branch_Regional_Centre_Branch", 
    "Call_Account_Min"."Geographic_Region" AS "Geographic_Region", 
    "Call_Account_Min"."Branch_Address_Line_3" AS "Branch_Address_Line_3", 
    "Call_Account_Min"."Account_Type" AS "Account_Type", 
    "Call_Account_Min"."Account_Basic_Number" AS "Account_Basic_Number", 
    "Call_Account_Min"."Customer_Name" AS "Customer_Name", 
    "Call_Account_Min"."Customer_Number_Internal" AS "Customer_Number_Internal", 
    "Call_Account_Min"."Customer_Type" AS "Customer_Type", 
    "Call_Account_Min"."Customer_Default_Branch" AS "Customer_Default_Branch", 
    "Call_Account_Min"."Customer_Branch_Number" AS "Customer_Branch_Number", 
    SUM("Call_Account_Min"."Daily") AS "Daily", 
    SUM("Call_Account_Min"."MTD") AS "MTD", 
    SUM("Call_Account_Min"."YTD") AS "YTD"
FROM
    "Call_Account_Min"
        LEFT OUTER JOIN "Interest_Account"
        ON "Call_Account_Min"."Account_Number_Internal" = "Interest_Account"."Account_Number" 
GROUP BY 
    "Call_Account_Min"."Account_Number", 
    "Call_Account_Min"."Account_Number_Internal", 
    "Call_Account_Min"."Currency_Code", 
    "Call_Account_Min"."Date_Account_Opened", 
    "Call_Account_Min"."Created_By", 
    "Interest_Account"."Actual_Rate_Credit", 
    "Interest_Account"."Cr_int_Profit_Period_Start_Next_Business_Day", 
    "Call_Account_Min"."Receiving_Account_Minimum_Transfer_Amount", 
    "Call_Account_Min"."Branch_Number", 
    "Call_Account_Min"."Branch_Regional_Centre_Branch", 
    "Call_Account_Min"."Geographic_Region", 
    "Call_Account_Min"."Branch_Address_Line_3", 
    "Call_Account_Min"."Account_Type", 
    "Call_Account_Min"."Account_Basic_Number", 
    "Call_Account_Min"."Customer_Name", 
    "Call_Account_Min"."Customer_Number_Internal", 
    "Call_Account_Min"."Customer_Type", 
    "Call_Account_Min"."Customer_Default_Branch", 
    "Call_Account_Min"."Customer_Branch_Number"
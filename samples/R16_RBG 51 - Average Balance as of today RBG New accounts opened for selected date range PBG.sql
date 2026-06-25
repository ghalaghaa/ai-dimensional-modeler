SELECT
    "D1"."C0" AS "Account_Number", 
    "D1"."C1" AS "Account_Number_Internal", 
    "D1"."C2" AS "Account_Basic_Number", 
    "D1"."C3" AS "Account_Basic_Number_Internal", 
    "D1"."C4" AS "Customer_Name", 
    SUM("D1"."C10") AS "Balance_Sheet__45_", 
    "D1"."C5" AS "Balance_Sheet_Description", 
    "D1"."C6" AS "Branch_Name", 
    "D1"."C7" AS "Customer_Entry_Date", 
    "D1"."C8" AS "Account_Type", 
    "D1"."C9" AS "Days_Customer_in", 
    CAST(SUM("D1"."C10") AS DOUBLE PRECISION) / NULLIF(MIN("D1"."C9"), 0) AS "Average_Balance"
FROM
    (
    SELECT
        "Account_Details"."Account_Number_External" AS "C0", 
        "Account_Details"."Account_Number" AS "C1", 
        "Account_Details"."Account_Basic_Number_External" AS "C2", 
        "Account_Details"."Account_Basic_Number" AS "C3", 
        "Customer"."Customer_Name" AS "C4", 
        "Balance_Sheet"."Balance_Sheet_Description" AS "C5", 
        "Branch_Details"."Branch_Finance_Name" AS "C6", 
        "Customer"."Customer_Entry_Date" AS "C7", 
        "Account_Details"."Account_Type" AS "C8", 
        DATEDIFF(DAY, "Customer"."Customer_Entry_Date", getdate()) AS "C9", 
        "Account_Daily_Balances"."Balance_Last_Business_Day_Local" + "Account_Daily_Balances"."Shadow_Adjustment_Local" AS "C10"
    FROM
        "Equation_Presentation"."dbo"."F_Account_Balance" "Account_Daily_Balances"
            INNER JOIN "Equation_Presentation"."dbo"."D_Balance_Sheet" "Balance_Sheet"
            ON "Account_Daily_Balances"."Balance_Sheet_Code" = "Balance_Sheet"."Balance_Sheet_Code"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details"
                ON "Account_Details"."Account_Number" = "Account_Daily_Balances"."Account_Number"
                    INNER JOIN "Equation_Presentation"."dbo"."D_Branch" "Branch_Details"
                    ON "Branch_Details"."Branch_Number" = "Account_Details"."Account_Branch"
                        FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                        ON "Account_Details"."Customer_Number" = "Customer"."Customer_Number" 
    WHERE 
        "Branch_Details"."Branch_Code_1" = 'BH104' AND
        "Account_Details"."Account_Type" IN ( 
            :P_Account_Type: ) AND
        "Account_Daily_Balances"."Account_Balance_Date" = CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
        "Customer"."Customer_Entry_Date" >= CAST(DATEADD(DAY, FLOOR((DATEPART(DAYOFYEAR, CAST(CURRENT_TIMESTAMP AS DATE)) - 1) * -1), CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
        "Customer"."Customer_Entry_Date" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME)
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
    "D1"."C9"
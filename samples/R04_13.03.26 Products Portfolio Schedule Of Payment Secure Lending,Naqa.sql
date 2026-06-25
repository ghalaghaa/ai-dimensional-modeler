SELECT
    "Average_Naqa"."Account_Basic_Number_Internal", 
    CAST("Average_Naqa"."Month_Balance_In_SAR" AS DOUBLE PRECISION) / NULLIF("Average_Naqa"."MTD_Days", 0), 
    CAST("Average_Naqa"."Year_Balance_In_SAR" AS DOUBLE PRECISION) / NULLIF("Average_Naqa"."YTD_Days", 0)
FROM
    (
    SELECT
        "D1"."C0" AS "Account_Basic_Number", 
        "D1"."C1" AS "Account_Basic_Number_Internal", 
        SUM("D1"."C5") AS "Year_Balance_In_SAR", 
        SUM("D1"."C6") AS "Month_Balance_In_SAR", 
        "D1"."C2" AS "YTD_Days", 
        "D1"."C3" AS "MTD_Days", 
        "D1"."C4" AS "Account_Branch", 
        SUM("D1"."C7") AS "Balance_Sheet"
    FROM
        (
        SELECT
            "Account_Details1"."Account_Basic_Number_External" AS "C0", 
            "Account_Details1"."Account_Basic_Number" AS "C1", 
            DATEPART(DAYOFYEAR, DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))) AS "C2", 
            DATEDIFF(DAY, DATEADD(DAY, -DAY(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))), DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE))) AS "C3", 
            "Account_Details1"."Account_Branch" AS "C4", 
            "Account_Daily_Balances"."Balance_Last_Business_Day_Local" AS "C5", 
            CASE 
                WHEN month("Account_Daily_Balances"."Account_Balance_Date") = month(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))) THEN "Account_Daily_Balances"."Balance_Last_Business_Day_Local"
            END AS "C6", 
            CASE 
                WHEN "Account_Daily_Balances"."Account_Balance_Date" = CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) THEN "Account_Daily_Balances"."Balance_Last_Business_Day_Local"
            END AS "C7"
        FROM
            "Equation_Presentation"."dbo"."D_Account" "Account_Details1"
                INNER JOIN "Equation_Presentation"."dbo"."F_Account_Balance" "Account_Daily_Balances"
                ON "Account_Details1"."Account_Number" = "Account_Daily_Balances"."Account_Number" 
        WHERE 
            year("Account_Daily_Balances"."Account_Balance_Date") = year(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))) AND
            "Account_Details1"."Account_Type" IN ( 
                'NL', 
                'FJ', 
                'FE', 
                'NQ' )
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3", 
        "D1"."C4"
    ) "Average_Naqa"

SELECT
    "Branch"."Customer_Branch_Number", 
    "Branch"."Customer_Branch_Mnemonic", 
    "Branch"."Branch_Region", 
    "Branch"."Branch_City"
FROM
    (
    SELECT
        "SQL1"."Branch_Number" AS "Customer_Branch_Number", 
        "SQL1"."Branch_Regional_Centre_Branch" AS "Customer_Branch_Mnemonic", 
        "SQL1"."Branch_Address_3" AS "Branch_City", 
        "SQL1"."Branch_Level_4" AS "Branch_Region"
    FROM
        (
        select * from D_Branch
        ) "SQL1"("Branch_Number", "Branch_Name", "Branch_Address_1", "Branch_Address_2", "Branch_Address_3", "Branch_Address_4", "Branch_Address_5", "Branch_Telex", "Branch_Phone", "Branch_Sort_Code", "Branch_Clearing_Region", "Branch_Regional_Centre_Branch", "Branch_Level_0", "Branch_Code_0", "Branch_Level_1", "Branch_Code_1", "Branch_Level_2", "Branch_Code_2", "Branch_Level_3", "Branch_Code_3", "Branch_Level_4", "Branch_Code_4", "Branch_Finance_Name") 
    GROUP BY 
        "SQL1"."Branch_Number", 
        "SQL1"."Branch_Regional_Centre_Branch", 
        "SQL1"."Branch_Address_3", 
        "SQL1"."Branch_Level_4"
    ) "Branch"

SELECT
    "Customer7"."Customer_Number", 
    "Customer7"."Customer_Name", 
    "Customer7"."Customer_Type", 
    "Customer7"."Customer_Branch_Mnemonic", 
    "Customer7"."Iqama_OR_Saudi_ID", 
    "Customer7"."Customer_Birth_Date", 
    "Customer7"."Customer_Group_Description", 
    "Customer7"."Customer_Branch_Number", 
    "Customer7"."Mobile_Number", 
    "Customer7"."Landline_Number", 
    "Customer7"."No_of_Dependants", 
    "Customer7"."Educational_Background", 
    "Customer7"."Marital_Status"
FROM
    (
    SELECT
        "D1"."C0" AS "Customer_Number", 
        "D1"."C1" AS "Customer_Name", 
        "D1"."C2" AS "Customer_Type", 
        "D1"."C3" AS "Customer_Branch_Mnemonic", 
        "D1"."C4" AS "Iqama_OR_Saudi_ID", 
        "D1"."C5" AS "Customer_Birth_Date", 
        "D1"."C6" AS "Customer_Group_Description", 
        "D1"."C7" AS "Customer_Branch_Number", 
        "D1"."C8" AS "Mobile_Number", 
        "D1"."C9" AS "Landline_Number", 
        SUM("D1"."C14") AS "Payroll_O_S", 
        SUM("D1"."C15") AS "Balance_Last_Business_Day", 
        "D1"."C10" AS "No_of_Dependants", 
        "D1"."C11" AS "Educational_Background", 
        "D1"."C12" AS "Marital_Status", 
        "D1"."C13" AS "C4_Rating"
    FROM
        (
        SELECT
            "Customer"."Customer_Number_External" AS "C0", 
            "Customer"."Customer_Name" AS "C1", 
            "Customer"."Customer_Type" AS "C2", 
            "Customer"."Customer_Branch_Mnemonic" AS "C3", 
            "Customer_Additional_Detail_2"."Iqama_OR_Saudi_ID" AS "C4", 
            "Customer_Additional_Detail_2"."Customer_Birth_Date" AS "C5", 
            "Customer"."Customer_Group_Description" AS "C6", 
            "Customer"."Customer_Branch_Number" AS "C7", 
            CASE 
                WHEN 
                    "Customer_Address_Main"."Mobile_Number" = ' ' OR
                    "Customer_Address_Main"."Mobile_Number" IS NULL
                    THEN
                        "Customer_Additional_Detail_2"."Mobile_Number"
                ELSE "Customer_Address_Main"."Mobile_Number"
            END AS "C8", 
            "Customer_Address_Main"."Phone_Number" AS "C9", 
            "Customer_Additional_Detail_2"."No_Of_Dependents" AS "C10", 
            CASE "Customer_Additional_Detail_2"."Academic_Qualification"
                WHEN '1' THEN 'HIGHER STUDIES'
                WHEN '2' THEN 'UNIVERSITY'
                WHEN '3' THEN 'SEC. SCHOOL OR LESS'
                ELSE 'OTHERS'
            END AS "C11", 
            "Customer_Additional_Detail_2"."Marital_Status" AS "C12", 
            "Customer"."C4_Rating" AS "C13", 
            CASE 
                WHEN "Account_Details"."Account_Suffix" = '053' THEN "Account_Details"."Balance_Last_Business_Day"
                ELSE 0
            END AS "C14", 
            CASE 
                WHEN 
                    "Account_Details"."Account_Type" IN ( 
                        'CA', 
                        'CE' )
                    THEN
                        "Account_Details"."Balance_Last_Business_Day"
                ELSE 0
            END AS "C15"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details"
                ON "Branch_Details"."Branch_Number" = "Account_Details"."Account_Branch"
                    FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                    ON "Account_Details"."Customer_Number" = "Customer"."Customer_Number"
                        LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Customer_Additional_Detail2" "Customer_Additional_Detail_2"
                        ON "Customer"."Customer_Number" = "Customer_Additional_Detail_2"."customer_Number"
                            LEFT OUTER JOIN 
                            (
                            SELECT
                                "D_Customer_Address"."Phone_Number" AS "Phone_Number", 
                                "D_Customer_Address"."Customer_Basic_Number" AS "Customer_Basic_Number", 
                                "D_Customer_Address"."Mobile_Number" AS "Mobile_Number"
                            FROM
                                "Equation_Presentation"."dbo"."D_Customer_Address" "D_Customer_Address" 
                            WHERE 
                                "D_Customer_Address"."Address_Category" = 'M' AND
                                "D_Customer_Address"."Address_Type" = 'NA'
                            ) "Customer_Address_Main"
                            ON "Customer_Address_Main"."Customer_Basic_Number" = "Customer"."Customer_Number" 
        WHERE 
            "Branch_Details"."Branch_Code_1" = 'BH104'
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
        "D1"."C13"
    ) "Customer7"

SELECT
    "Interest_Status_Deal"."Deal_Account_Branch", 
    "Interest_Status_Deal"."Deal_Type", 
    "Interest_Status_Deal"."Deal_Reference", 
    CAST("Interest_Status_Deal_Details"."Current_Deal_Amount" AS DOUBLE PRECISION) / 100, 
    (CAST("Interest_Status_Deal_Details"."Current_Deal_Amount" AS DOUBLE PRECISION) / NULLIF("Interest_Status_Deal_Currency"."No_Minor_Currency_Units_One_Major_Unit", 0)) * CAST("Interest_Status_Deal_Currency"."Spot_Rate_Against_Base_Currency" AS DECIMAL(17,7)), 
    CAST("Interest_Status_Deal_Details"."Original_Deal_Amount" AS DOUBLE PRECISION) / 100, 
    (CAST("Interest_Status_Deal_Details"."Original_Deal_Amount" AS DOUBLE PRECISION) / NULLIF("Interest_Status_Deal_Currency"."No_Minor_Currency_Units_One_Major_Unit", 0)) * CAST("Interest_Status_Deal_Currency"."Spot_Rate_Against_Base_Currency" AS DECIMAL(17,7)), 
    "Interest_Status_Deal_Details"."Start_Date", 
    "Interest_Status_Deal"."Maturity_Date", 
    "Interest_Status_Deal"."Actual_Rate", 
    "Interest_Status_Deal"."Deal_Account_Basic_Number_External", 
    "Interest_Status_Deal"."Deal_Account_Basic_Number", 
    "Interest_Status_Deal"."Deal_Account_Number_External", 
    "Interest_Status_Deal"."Deal_Account_Number", 
    "Interest_Status_Deal"."Last_Rollover_Date", 
    "Interest_Status_Deal"."Next_Rollover_Date", 
    "Interest_Status_Deal"."Deal_Currency", 
    "Interest_Status_Deal_Currency"."Currency_Name", 
    CASE 
        WHEN "Interest_Status_Deal"."Deal_Type" = 'RNQ' THEN 'NQ'
        WHEN "Interest_Status_Deal"."Deal_Type" = 'RNQ' THEN 'NL'
        WHEN "Interest_Status_Deal"."Deal_Type" = 'CWD' THEN 'FJ'
        WHEN "Interest_Status_Deal"."Deal_Type" = 'IDN' THEN 'FE'
    END
FROM
    "Equation_Presentation"."dbo"."D_Currency_History" "Interest_Status_Deal_Currency"
        INNER JOIN "Equation_Presentation"."dbo"."F_Interest_Status_Deal" "Interest_Status_Deal"
        ON 
            "Interest_Status_Deal_Currency"."Currency_Code" = "Interest_Status_Deal"."Deal_Currency" AND
            "Interest_Status_Deal_Currency"."Extract_Date" = "Interest_Status_Deal"."Account_History_Date"
            LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Term_Deal_Details" "Interest_Status_Deal_Details"
            ON 
                "Interest_Status_Deal_Details"."Deal_Reference" = "Interest_Status_Deal"."Deal_Reference" AND
                "Interest_Status_Deal_Details"."Deal_Type" = "Interest_Status_Deal"."Deal_Type" AND
                "Interest_Status_Deal_Details"."Branch_Number" = "Interest_Status_Deal"."Deal_Account_Branch" 
WHERE 
    "Interest_Status_Deal"."Deal_Type" IN ( 
        'RNQ', 
        'LNQ', 
        'CWD', 
        'IDN', 
        'NQW' ) AND
    "Interest_Status_Deal"."Processing_Date_Value_Balance_Local" <> 0 AND
    "Interest_Status_Deal_Details"."Current_Deal_Amount" <> 0 AND
    "Interest_Status_Deal"."Next_Rollover_Date" >= CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME)
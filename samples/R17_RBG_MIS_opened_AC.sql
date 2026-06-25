WITH 
"Customer_Address_Main" AS 
    (
    SELECT
        "D_Customer_Address"."Customer_Basic_Number" AS "Customer_Basic_Number", 
        "D_Customer_Address"."Mobile_Number" AS "Mobile_Number"
    FROM
        "Equation_Presentation"."dbo"."D_Customer_Address" "D_Customer_Address" 
    WHERE 
        "D_Customer_Address"."Address_Category" = 'M' AND
        "D_Customer_Address"."Address_Type" = 'NA'
    )
SELECT
    "D1"."C0" AS "Account_Branch", 
    "D1"."C1" AS "Customer_Entry_Date", 
    "D1"."C2" AS "Account_Basic_Number", 
    "D1"."C3" AS "Account_Basic_Number_Internal", 
    "D1"."C4" AS "Account_Suffix", 
    "D1"."C5" AS "Currency_Code", 
    "D1"."C6" AS "Date_Account_Opened", 
    "D1"."C7" AS "Date_Account_Closed", 
    SUM("D1"."C39") AS "Balance_Last_Business_Day", 
    "D1"."C8" AS "Branch_Number", 
    "D1"."C9" AS "Branch_Name", 
    "D1"."C10" AS "Customer_Name", 
    "D1"."C11" AS "Customer_Number", 
    "D1"."C12" AS "Customer_Number_Internal", 
    "D1"."C13" AS "Account_Type", 
    "D1"."C14" AS "Customer_Type", 
    "D1"."C15" AS "IVR_Flag", 
    "D1"."C16" AS "Customer_Status", 
    "D1"."C17" AS "Online_Banking_Flag", 
    "D1"."C18" AS "Gender", 
    "D1"."C19" AS "Iqama_OR_Saudi_ID", 
    "D1"."C20" AS "Customer_Birth_Date", 
    "D1"."C21" AS "Customer_location", 
    "D1"."C22" AS "Mobile_Number", 
    "D1"."C23" AS "Account_Number", 
    "D1"."C24" AS "Account_Number_Internal", 
    "D1"."C25" AS "Relationship_Manager", 
    "D1"."C26" AS "Relationship_Manager_Name", 
    "D1"."C27" AS "Nationality", 
    "D1"."C28" AS "Online_Flag", 
    "D1"."C29" AS "Gender_Description", 
    "D1"."C30" AS "Employer_Name", 
    "D1"."C31" AS "Purpose_of_Account", 
    SUM("D1"."C40") AS "ATM_Flag", 
    CASE 
        WHEN 
            SUM("D1"."C40") IN ( 
                0 )
            THEN
                'N'
        ELSE 'Y'
    END AS "ATM_Flag_Description", 
    "D1"."C32" AS "Branch_Level_1", 
    "D1"."C33" AS "Customer_Branch_Number", 
    "D1"."C34" AS "Customer_Economic_Sector_Code", 
    "D1"."C35" AS "Customer_Branch_Mnemonic", 
    "D1"."C36" AS "Customer_Branch_Equation_Name", 
    SUM("D1"."C41") AS "A_C_Balance__SAR_", 
    "D1"."C37" AS "Created_By", 
    "D1"."C38" AS "Created_By_Name"
FROM
    (
    SELECT
        "Account_Details"."Account_Branch" AS "C0", 
        "Customer"."Customer_Entry_Date" AS "C1", 
        "Account_Details"."Account_Basic_Number_External" AS "C2", 
        "Account_Details"."Account_Basic_Number" AS "C3", 
        "Account_Details"."Account_Suffix" AS "C4", 
        "Account_Details"."Currency_Code" AS "C5", 
        "Account_Details"."Date_Account_Opened" AS "C6", 
        "Account_Details"."Date_Account_Closed" AS "C7", 
        "Branch_Details"."Branch_Number" AS "C8", 
        "Branch_Details"."Branch_Finance_Name" AS "C9", 
        "Customer"."Customer_Name" AS "C10", 
        "Customer"."Customer_Number_External" AS "C11", 
        "Customer"."Customer_Number" AS "C12", 
        "Account_Details"."Account_Type" AS "C13", 
        "Account_Details"."Account_Customer_Type" AS "C14", 
        "Customer_Additional_Detail_2"."IVR_Flag" AS "C15", 
        "Customer_Additional_Detail_2"."Customer_Status" AS "C16", 
        "Customer_Additional_Detail_2"."Online_Banking_Flag" AS "C17", 
        "Customer_Additional_Detail_2"."Gender" AS "C18", 
        "Customer_Additional_Detail_2"."Iqama_OR_Saudi_ID" AS "C19", 
        "Customer_Additional_Detail_2"."Customer_Birth_Date" AS "C20", 
        "Customer_Additional_Detail_2"."Customer_location" AS "C21", 
        CASE 
            WHEN 
                "Customer_Address_Main"."Mobile_Number" = ' ' OR
                "Customer_Address_Main"."Mobile_Number" IS NULL
                THEN
                    "Customer_Additional_Detail_2"."Mobile_Number"
            ELSE "Customer_Address_Main"."Mobile_Number"
        END AS "C22", 
        "Account_Details"."Account_Number_External" AS "C23", 
        "Account_Details"."Account_Number" AS "C24", 
        "Customer_Additional_Detail"."Relationship_Manager" AS "C25", 
        "Customer_Additional_Detail"."Relationship_Manager_Name" AS "C26", 
        "Customer"."Customer_Parent_Country_Name" AS "C27", 
        CASE 
            WHEN 
                "Customer_Additional_Detail_2"."Online_Banking_Flag" IN ( 
                    77, 
                    78, 
                    79 )
                THEN
                    'Y'
            ELSE 'N'
        END AS "C28", 
        CASE 
            WHEN 
                "Customer_Additional_Detail_2"."Gender" IN ( 
                    'M' )
                THEN
                    'Male'
            ELSE 'Female'
        END AS "C29", 
        "Customer_Additional_Detail_2"."Employer_Name" AS "C30", 
        "Customer_Additional_Detail_2"."Purpose_of_Account" AS "C31", 
        "Branch_Details"."Branch_Level_1" AS "C32", 
        "Customer"."Customer_Branch_Number" AS "C33", 
        "Customer"."Customer_Economic_Sector_Code" AS "C34", 
        "Customer"."Customer_Branch_Mnemonic" AS "C35", 
        "Customer"."Customer_Branch_Name" AS "C36", 
        "Account_Details"."Created_By" AS "C37", 
        "Account_Details"."Created_By_Name" AS "C38", 
        "Account_Details"."Balance_Last_Business_Day" AS "C39", 
        "Customer_Additional_Detail_2"."ATM_Flag" AS "C40", 
        "Account_Daily_Balances"."Balance_Last_Business_Day_Local" AS "C41"
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
                            LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Customer_Additional_Detail" "Customer_Additional_Detail"
                            ON "Customer"."Customer_Number" = "Customer_Additional_Detail"."Customer_Number"
                                LEFT OUTER JOIN "Customer_Address_Main"
                                ON "Customer_Address_Main"."Customer_Basic_Number" = "Customer"."Customer_Number" 
    WHERE 
        "Account_Details"."Date_Account_Opened" BETWEEN DATEADD(DAY, -DAY(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))) AND DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) AND
        "Account_Details"."Account_Type" IN ( 
            'CA', 
            'CE', 
            'EA', 
            'EB', 
            'EC', 
            'CJ', 
            'JA', 
            'CF', 
            'CI', 
            'EI', 
            'CB', 
            'C5', 
            'K3' ) AND
        "Branch_Details"."Branch_Level_1" = 'Retail Banking Group' AND
        "Account_Daily_Balances"."Account_Balance_Date" = CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME)
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
    "D1"."C17", 
    "D1"."C18", 
    "D1"."C19", 
    "D1"."C20", 
    "D1"."C21", 
    "D1"."C22", 
    "D1"."C23", 
    "D1"."C24", 
    "D1"."C25", 
    "D1"."C26", 
    "D1"."C27", 
    "D1"."C28", 
    "D1"."C29", 
    "D1"."C30", 
    "D1"."C31", 
    "D1"."C32", 
    "D1"."C33", 
    "D1"."C34", 
    "D1"."C35", 
    "D1"."C36", 
    "D1"."C37", 
    "D1"."C38"
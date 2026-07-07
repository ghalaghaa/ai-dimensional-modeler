WITH 
"Account" AS 
    (
    SELECT DISTINCT 
        "Account_Details_UD"."Account_Basic_Number_External" AS "Account_Basic_Number", 
        MAX("Account_Details_UD"."Date_Last_Customer_Entry")
            OVER(
                PARTITION BY
                    "Account_Details_UD"."Account_Basic_Number_External"
            ) AS "Date_Last_Transaction", 
        MAX("Account_Latest_Transaction_UD"."Last_Customer_Transaction_Date")
            OVER(
                PARTITION BY
                    "Account_Details_UD"."Account_Basic_Number_External"
            ) AS "Last_Customer_Transaction_Date"
    FROM
        "Finance_MIS"."dbo"."D_Account_Details_UD" "Account_Details_UD"
            LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Account_Latest_Transaction_UD" "Account_Latest_Transaction_UD"
            ON "Account_Details_UD"."Account_Number" = "Account_Latest_Transaction_UD"."Account_Number"
    ), 
"Customer_Additional_Detail2_RBG" AS 
    (
    SELECT
        "D_Customer_Additional_Detail2_RBG"."Purpose_of_Account" AS "Purpose_of_Account", 
        "D_Customer_Additional_Detail2_RBG"."Gender" AS "Gender", 
        "D_Customer_Additional_Detail2_RBG"."Nationality" AS "Nationality", 
        "D_Customer_Additional_Detail2_RBG"."Marital_Status_Desc" AS "Marital_Status_Desc", 
        "D_Customer_Additional_Detail2_RBG"."ID_Expiry_Date_HJ" AS "ID_Expiry_Date_HJ", 
        "D_Customer_Additional_Detail2_RBG"."Cust_Address_P_O_Box" AS "Cust_Address_P_O_Box", 
        "D_Customer_Additional_Detail2_RBG"."Cust_Address_Zip_Code" AS "Cust_Address_Zip_Code", 
        "D_Customer_Additional_Detail2_RBG"."Cust_Address_City" AS "Cust_Address_City", 
        "D_Customer_Additional_Detail2_RBG"."Land_line_Number" AS "Land_line_Number", 
        "D_Customer_Additional_Detail2_RBG"."Employer_Name" AS "Employer_Name", 
        "D_Customer_Additional_Detail2_RBG"."Date_Documents_Last_Updated" AS "Date_Documents_Last_Updated", 
        "D_Customer_Additional_Detail2_RBG"."Occupation_English_Desc" AS "Occupation_English_Desc", 
        "D_Customer_Additional_Detail2_RBG"."No_Of_Dependents" AS "No_Of_Dependents", 
        "D_Customer_Additional_Detail2_RBG"."Customer_Number" AS "Customer_Number", 
        "D_Customer_Additional_Detail2_RBG"."Customer_Birth_Date" AS "Customer_Birth_Date", 
        "D_Customer_Additional_Detail2_RBG"."Customer_Status" AS "Customer_Status", 
        "D_Customer_Additional_Detail2_RBG"."Mobile_Number" AS "Mobile_Number", 
        "D_Customer_Additional_Detail2_RBG"."Cust_Address_Street" AS "Cust_Address_Street", 
        "D_Customer_Additional_Detail2_RBG"."Academic_Qualification" AS "Academic_Qualification", 
        "D_Customer_Additional_Detail2_RBG"."Academic_Qualification_Others" AS "Academic_Qualification_Others"
    FROM
        "Finance_MIS"."dbo"."D_Customer_Additional_Detail2_RBG" "D_Customer_Additional_Detail2_RBG" 
    WHERE 
        "D_Customer_Additional_Detail2_RBG"."Customer_Number" <> 'SADEEM'
    ), 
"UpGrade_DownGrade_RBG" AS 
    (
    SELECT
        "F_UpGrade_DownGrade_RBG"."Customer_number" AS "Customer_number", 
        "F_UpGrade_DownGrade_RBG"."Count_Dinar" AS "Count_Dinar", 
        "F_UpGrade_DownGrade_RBG"."Dinar_Last_Business_Day_Balance" AS "Dinar_Last_Business_Day_Balance", 
        "F_UpGrade_DownGrade_RBG"."Count_Real_Estate" AS "Count_Real_Estate", 
        "F_UpGrade_DownGrade_RBG"."Real_Estate_Last_Business_Day_Balance" AS "Real_Estate_Last_Business_Day_Balance", 
        "F_UpGrade_DownGrade_RBG"."End_Of_Month_Date" AS "End_Of_Month_Date"
    FROM
        "Finance_MIS"."dbo"."F_UpGrade_DownGrade_RBG" "F_UpGrade_DownGrade_RBG" 
    WHERE 
        "F_UpGrade_DownGrade_RBG"."Customer_number" <> 'SADEEM'
    ), 
"Customer_Details_Month_End" AS 
    (
    SELECT
        "D_Customer_Details_Month_End"."Customer_Branch_Number" AS "Customer_Branch_Number", 
        "D_Customer_Details_Month_End"."Customer_Branch_Name" AS "Customer_Branch_Name", 
        "D_Customer_Details_Month_End"."Customer_Number_External" AS "Customer_Number_External", 
        "D_Customer_Details_Month_End"."Customer_Number" AS "Customer_Number", 
        "D_Customer_Details_Month_End"."Customer_Type" AS "Customer_Type", 
        "D_Customer_Details_Month_End"."Customer_Type_Description" AS "Customer_Type_Description", 
        "D_Customer_Details_Month_End"."Customer_Inactive_Flag" AS "Customer_Inactive_Flag", 
        "D_Customer_Details_Month_End"."Customer_Entry_Date" AS "Customer_Entry_Date", 
        "D_Customer_Details_Month_End"."Customer_Name" AS "Customer_Name", 
        "D_Customer_Details_Month_End"."Customer_Reference" AS "Customer_Reference"
    FROM
        "Finance_MIS"."dbo"."D_Customer_Details_Month_End" "D_Customer_Details_Month_End" 
    WHERE 
        "D_Customer_Details_Month_End"."Customer_Number" <> 'SADEEM'
    ), 
"Cust_Month_End_Flag_Details" AS 
    (
    SELECT
        "D_Cust_Month_End_Flag_Details"."Cust_IVR_Flag" AS "Cust_IVR_Flag", 
        "D_Cust_Month_End_Flag_Details"."Cust_Online_Flag" AS "Cust_Online_Flag", 
        "D_Cust_Month_End_Flag_Details"."Cust_ATM_Flag" AS "Cust_ATM_Flag", 
        "D_Cust_Month_End_Flag_Details"."Sales_Program_Code_1" AS "Sales_Program_Code_1", 
        "D_Cust_Month_End_Flag_Details"."Customer_Number" AS "Customer_Number", 
        "D_Cust_Month_End_Flag_Details"."Customer_Closed_Flag" AS "Customer_Closed_Flag", 
        "D_Cust_Month_End_Flag_Details"."Payroll_Flag" AS "Payroll_Flag", 
        "D_Cust_Month_End_Flag_Details"."No_Of_Credit_Card" AS "No_Of_Credit_Card", 
        "D_Cust_Month_End_Flag_Details"."End_Of_Month_Date" AS "End_Of_Month_Date"
    FROM
        "Finance_MIS"."dbo"."D_Cust_Month_End_Flag_Details" "D_Cust_Month_End_Flag_Details" 
    WHERE 
        "D_Cust_Month_End_Flag_Details"."Customer_Number" <> 'SADEEM'
    ), 
"Data0" AS 
    (
    SELECT
        "D1"."C0" AS "Branch_Level_4", 
        "D1"."C1" AS "Customer_Branch_Number", 
        "D1"."C2" AS "Customer_Branch_Name", 
        "D1"."C3" AS "Customer_Number", 
        "D1"."C4" AS "Customer_Number_Internal", 
        "D1"."C5" AS "Customer_Name", 
        "D1"."C6" AS "Customer_Type", 
        "D1"."C7" AS "Customer_Type_Description", 
        "D1"."C8" AS "Purpose_of_Account", 
        "D1"."C9" AS "Customer_Status", 
        "D1"."C10" AS "Customer_Inactive_Flag", 
        "D1"."C11" AS "Customer_Entry_Date", 
        "D1"."C12" AS "Gender", 
        "D1"."C13" AS "Age", 
        "D1"."C14" AS "Nationality", 
        "D1"."C15" AS "Marital_Status_Desc", 
        "D1"."C16" AS "Iqama_OR_Saudi_ID", 
        "D1"."C17" AS "ID_Expiry_Date_HJ", 
        "D1"."C18" AS "Cust_Address_P_O_Box", 
        "D1"."C19" AS "Cust_Address_Street", 
        "D1"."C20" AS "Cust_Address_Zip_Code", 
        "D1"."C21" AS "Cust_Address_City", 
        "D1"."C22" AS "Land_line_Number", 
        "D1"."C23" AS "Mobile_Number", 
        "D1"."C24" AS "Employer_Name", 
        "D1"."C25" AS "IVR_Flag", 
        "D1"."C26" AS "Online_Banking_Flag", 
        "D1"."C27" AS "ATM_Flag", 
        "D1"."C28" AS "Credit_Card_Flag", 
        "D1"."C29" AS "Payroll_Flag", 
        "D1"."C30" AS "Date_Documents_Last_Updated", 
        "D1"."C31" AS "Current_Segment_Code", 
        "D1"."C32" AS "Current_Segment_Desc", 
        "D1"."C33" AS "Occupation_English_Desc", 
        "D1"."C34" AS "Dinar", 
        "D1"."C35" AS "Rea_Estate", 
        "D1"."C36" AS "No_Of_Dependents", 
        "D1"."C37" AS "Academic_Qualification"
    FROM
        (
        SELECT
            "Branch_Details_UD"."Branch_Level_4" AS "C0", 
            "Customer_Details_Month_End"."Customer_Branch_Number" AS "C1", 
            "Customer_Details_Month_End"."Customer_Branch_Name" AS "C2", 
            "Customer_Details_Month_End"."Customer_Number_External" AS "C3", 
            "Customer_Details_Month_End"."Customer_Number" AS "C4", 
            replace(replace("Customer_Details_Month_End"."Customer_Name", char(13), ' '), char(10), ' ') AS "C5", 
            "Customer_Details_Month_End"."Customer_Type" AS "C6", 
            "Customer_Details_Month_End"."Customer_Type_Description" AS "C7", 
            "Customer_Additional_Detail2_RBG"."Purpose_of_Account" AS "C8", 
            CASE 
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '1' THEN 'Normal'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '2' THEN 'Minor'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '3' THEN 'Incompetent'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '4' THEN 'Mentally Disabled'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '5' THEN 'Prisoner'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '6' THEN 'PEP Customer'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '7' THEN 'Blind'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '8' THEN 'Hearing Disability'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = '9' THEN 'Joint Account'
                WHEN "Customer_Additional_Detail2_RBG"."Customer_Status" = 'A' THEN 'Diplomat'
            END AS "C9", 
            "Customer_Details_Month_End"."Customer_Inactive_Flag" AS "C10", 
            "Customer_Details_Month_End"."Customer_Entry_Date" AS "C11", 
            "Customer_Additional_Detail2_RBG"."Gender" AS "C12", 
            "Finance_MIS"."dbo"."Customer_Age"("Customer_Additional_Detail2_RBG"."Customer_Birth_Date") AS "C13", 
            "Customer_Additional_Detail2_RBG"."Nationality" AS "C14", 
            "Customer_Additional_Detail2_RBG"."Marital_Status_Desc" AS "C15", 
            SUBSTRING("Customer_Details_Month_End"."Customer_Reference", 3, 10) AS "C16", 
            "Customer_Additional_Detail2_RBG"."ID_Expiry_Date_HJ" AS "C17", 
            "Customer_Additional_Detail2_RBG"."Cust_Address_P_O_Box" AS "C18", 
            replace(replace("Customer_Additional_Detail2_RBG"."Cust_Address_Street", char(13), ' '), char(10), ' ') AS "C19", 
            "Customer_Additional_Detail2_RBG"."Cust_Address_Zip_Code" AS "C20", 
            "Customer_Additional_Detail2_RBG"."Cust_Address_City" AS "C21", 
            "Customer_Additional_Detail2_RBG"."Land_line_Number" AS "C22", 
            replace(replace("Customer_Additional_Detail2_RBG"."Mobile_Number", char(13), ' '), char(10), ' ') AS "C23", 
            "Customer_Additional_Detail2_RBG"."Employer_Name" AS "C24", 
            "Cust_Month_End_Flag_Details"."Cust_IVR_Flag" AS "C25", 
            "Cust_Month_End_Flag_Details"."Cust_Online_Flag" AS "C26", 
            "Cust_Month_End_Flag_Details"."Cust_ATM_Flag" AS "C27", 
            CASE 
                WHEN "Cust_Month_End_Flag_Details"."No_Of_Credit_Card" = 0 THEN 'N'
                ELSE 'Y'
            END AS "C28", 
            CASE 
                WHEN 
                    "Cust_Month_End_Flag_Details"."Payroll_Flag" IS NULL OR
                    "Cust_Month_End_Flag_Details"."Payroll_Flag" = ' '
                    THEN
                        'N'
                ELSE "Cust_Month_End_Flag_Details"."Payroll_Flag"
            END AS "C29", 
            "Customer_Additional_Detail2_RBG"."Date_Documents_Last_Updated" AS "C30", 
            "Cust_Month_End_Flag_Details"."Sales_Program_Code_1" AS "C31", 
            "Segment_Arabic_Details"."Segment_Description" AS "C32", 
            "Customer_Additional_Detail2_RBG"."Occupation_English_Desc" AS "C33", 
            CASE 
                WHEN 
                    "UpGrade_DownGrade_RBG"."Count_Dinar" <> 0 AND
                    isnull("UpGrade_DownGrade_RBG"."Dinar_Last_Business_Day_Balance", 0) <> 0
                    THEN
                        'Y'
                ELSE 'N'
            END AS "C34", 
            CASE 
                WHEN 
                    "UpGrade_DownGrade_RBG"."Count_Real_Estate" <> 0 AND
                    isnull("UpGrade_DownGrade_RBG"."Real_Estate_Last_Business_Day_Balance", 0) <> 0
                    THEN
                        'Y'
                ELSE 'N'
            END AS "C35", 
            "Customer_Additional_Detail2_RBG"."No_Of_Dependents" AS "C36", 
            CASE "Customer_Additional_Detail2_RBG"."Academic_Qualification"
                WHEN '1' THEN 'HIGHER STUDIES'
                WHEN '2' THEN 'UNIVERSITY'
                WHEN '3' THEN 'SEC. SCHOOL OR LESS'
                ELSE "Customer_Additional_Detail2_RBG"."Academic_Qualification_Others"
            END AS "C37"
        FROM
            "Customer_Additional_Detail2_RBG"
                INNER JOIN "UpGrade_DownGrade_RBG"
                ON "Customer_Additional_Detail2_RBG"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                    INNER JOIN "Customer_Details_Month_End"
                    ON "Customer_Details_Month_End"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                        LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Branch_Details_UD" "Branch_Details_UD"
                        ON "Branch_Details_UD"."Branch_Number" = "Customer_Details_Month_End"."Customer_Branch_Number"
                            LEFT OUTER JOIN "Cust_Month_End_Flag_Details"
                            ON 
                                "Cust_Month_End_Flag_Details"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number" AND
                                "Cust_Month_End_Flag_Details"."End_Of_Month_Date" = "UpGrade_DownGrade_RBG"."End_Of_Month_Date"
                                LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Segment_Arabic_Details" "Segment_Arabic_Details"
                                ON "Segment_Arabic_Details"."Segment_Code" = "Cust_Month_End_Flag_Details"."Sales_Program_Code_1"
                                    LEFT OUTER JOIN "Finance_MIS"."dbo"."D_RBG_Customers_UD" "RBG_Customers_UD"
                                    ON "RBG_Customers_UD"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number" 
        WHERE 
            "UpGrade_DownGrade_RBG"."End_Of_Month_Date" = CAST(DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))))) as DATETIME) AND
            (CASE 
                WHEN "RBG_Customers_UD"."Customer_Number" <> ' ' THEN 'Y'
                ELSE 'N'
            END = 'Y' OR
            "Customer_Details_Month_End"."Customer_Number_External" <= 750000 OR
            "Customer_Details_Month_End"."Customer_Number_External" > 999999) AND
            "Cust_Month_End_Flag_Details"."Customer_Closed_Flag" = 'N'
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
        "D1"."C37"
    )
SELECT
    "D1"."C0" AS "Branch_Level_4", 
    "D1"."C1" AS "Customer_Branch_Number", 
    "D1"."C2" AS "Customer_Branch_Name", 
    "D1"."C3" AS "Customer_Number", 
    "D1"."C4" AS "Customer_Number_Internal", 
    "D1"."C5" AS "Customer_Name", 
    "D1"."C6" AS "Customer_Type", 
    "D1"."C7" AS "Customer_Type_Description", 
    "D1"."C8" AS "Purpose_of_Account", 
    "D1"."C9" AS "Customer_Status", 
    "D1"."C10" AS "Customer_Inactive_Flag", 
    "D1"."C11" AS "Customer_Entry_Date", 
    "D1"."C12" AS "Date_Last_Transaction", 
    "D1"."C13" AS "Active_6_Months", 
    "D1"."C14" AS "Gender", 
    "D1"."C15" AS "Age", 
    "D1"."C16" AS "Nationality", 
    "D1"."C17" AS "Marital_Status_Desc", 
    "D1"."C18" AS "Iqama_OR_Saudi_ID", 
    "D1"."C19" AS "ID_Expiry_Date_HJ", 
    "D1"."C20" AS "Cust_Address_P_O_Box", 
    "D1"."C21" AS "Cust_Address_Street", 
    "D1"."C22" AS "Last_Customer_Transaction_Date", 
    "D1"."C23" AS "Cust_Address_Zip_Code", 
    "D1"."C24" AS "Cust_Address_City", 
    "D1"."C25" AS "Land_line_Number", 
    "D1"."C26" AS "Mobile_Number", 
    "D1"."C27" AS "Employer_Name", 
    "D1"."C28" AS "IVR_Flag", 
    "D1"."C29" AS "Online_Banking_Flag", 
    "D1"."C30" AS "ATM_Flag", 
    "D1"."C31" AS "Credit_Card_Flag", 
    "D1"."C32" AS "Payroll_Flag", 
    "D1"."C33" AS "Date_Documents_Last_Updated", 
    "D1"."C34" AS "Current_Segment_Code", 
    "D1"."C35" AS "Current_Segment_Desc", 
    "D1"."C36" AS "Occupation_English_Desc", 
    "D1"."C37" AS "Dinar", 
    "D1"."C38" AS "Real_Estate", 
    "D1"."C39" AS "No_Of_Dependents", 
    "D1"."C40" AS "Academic_Qualification"
FROM
    (
    SELECT
        "Data0"."Branch_Level_4" AS "C0", 
        "Data0"."Customer_Branch_Number" AS "C1", 
        "Data0"."Customer_Branch_Name" AS "C2", 
        "Data0"."Customer_Number" AS "C3", 
        "Data0"."Customer_Number_Internal" AS "C4", 
        "Data0"."Customer_Name" AS "C5", 
        "Data0"."Customer_Type" AS "C6", 
        "Data0"."Customer_Type_Description" AS "C7", 
        "Data0"."Purpose_of_Account" AS "C8", 
        "Data0"."Customer_Status" AS "C9", 
        "Data0"."Customer_Inactive_Flag" AS "C10", 
        "Data0"."Customer_Entry_Date" AS "C11", 
        "Account"."Date_Last_Transaction" AS "C12", 
        CASE 
            WHEN DATEDIFF(DAY, "Account"."Date_Last_Transaction", DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE)))))) <= 180 THEN 'Y'
            ELSE 'N'
        END AS "C13", 
        "Data0"."Gender" AS "C14", 
        "Data0"."Age" AS "C15", 
        "Data0"."Nationality" AS "C16", 
        "Data0"."Marital_Status_Desc" AS "C17", 
        "Data0"."Iqama_OR_Saudi_ID" AS "C18", 
        "Data0"."ID_Expiry_Date_HJ" AS "C19", 
        "Data0"."Cust_Address_P_O_Box" AS "C20", 
        "Data0"."Cust_Address_Street" AS "C21", 
        "Account"."Last_Customer_Transaction_Date" AS "C22", 
        "Data0"."Cust_Address_Zip_Code" AS "C23", 
        "Data0"."Cust_Address_City" AS "C24", 
        "Data0"."Land_line_Number" AS "C25", 
        "Data0"."Mobile_Number" AS "C26", 
        "Data0"."Employer_Name" AS "C27", 
        "Data0"."IVR_Flag" AS "C28", 
        "Data0"."Online_Banking_Flag" AS "C29", 
        "Data0"."ATM_Flag" AS "C30", 
        "Data0"."Credit_Card_Flag" AS "C31", 
        "Data0"."Payroll_Flag" AS "C32", 
        "Data0"."Date_Documents_Last_Updated" AS "C33", 
        "Data0"."Current_Segment_Code" AS "C34", 
        "Data0"."Current_Segment_Desc" AS "C35", 
        "Data0"."Occupation_English_Desc" AS "C36", 
        "Data0"."Dinar" AS "C37", 
        "Data0"."Rea_Estate" AS "C38", 
        "Data0"."No_Of_Dependents" AS "C39", 
        "Data0"."Academic_Qualification" AS "C40"
    FROM
        "Data0"
            LEFT OUTER JOIN "Account"
            ON "Data0"."Customer_Number" = "Account"."Account_Basic_Number"
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
    "D1"."C38", 
    "D1"."C39", 
    "D1"."C40"
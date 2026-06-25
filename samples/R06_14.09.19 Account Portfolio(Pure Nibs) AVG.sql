WITH 
"UpGrade_DownGrade_RBG" AS 
    (
    SELECT
        "F_UpGrade_DownGrade_RBG"."Customer_number" AS "Customer_number", 
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
        "D_Customer_Details_Month_End"."Customer_Number_External" AS "Customer_Number_External", 
        "D_Customer_Details_Month_End"."Customer_Number" AS "Customer_Number", 
        "D_Customer_Details_Month_End"."Customer_Name" AS "Customer_Name"
    FROM
        "Finance_MIS"."dbo"."D_Customer_Details_Month_End" "D_Customer_Details_Month_End" 
    WHERE 
        "D_Customer_Details_Month_End"."Customer_Number" <> 'SADEEM'
    ), 
"Closed" AS 
    (
    SELECT
        "D1"."C0" AS "Branch_Number", 
        "D1"."C1" AS "Customer_number", 
        "D1"."C2" AS "Customer_Number_Internal", 
        "D1"."C3" AS "Customer_Name", 
        "D1"."C4" AS "Account_Basic_Number", 
        "D1"."C5" AS "Account_Suffix", 
        "D1"."C6" AS "Account_Branch", 
        "D1"."C7" AS "Date_Account_Closed", 
        "D1"."C8" AS "Count_Pure_NIBS_Acc", 
        "D1"."C9" AS "Pure_NIBS_AVG_Acc", 
        "D1"."C10" AS "Three_months_Pure_NIBS_AVG_Acc", 
        "D1"."C11" AS "Six_months_Pure_NIBS_AVG_Acc", 
        "D1"."C12" AS "Pure_NIBS_Last_Business_Day_Balance"
    FROM
        (
        SELECT
            "Customer_Details_Month_End"."Customer_Branch_Number" AS "C0", 
            "Customer_Details_Month_End"."Customer_Number_External" AS "C1", 
            "Customer_Details_Month_End"."Customer_Number" AS "C2", 
            replace(replace("Customer_Details_Month_End"."Customer_Name", char(13), ' '), char(10), ' ') AS "C3", 
            "Account_Details_UD5"."Account_Basic_Number_External" AS "C4", 
            "Account_Details_UD5"."Account_Suffix" AS "C5", 
            "Account_Details_UD5"."Account_Branch" AS "C6", 
            "Account_Details_UD5"."Date_Account_Closed" AS "C7", 
            "F_Monthly_Acct_Level_UD6"."Count_Pure_NIBS" AS "C8", 
            "F_Monthly_Acct_Level_UD6"."Pure_NIBS_AVG" AS "C9", 
            "F_Monthly_Acct_Level_UD6"."Three_months_Pure_NIBS_AVG" AS "C10", 
            "F_Monthly_Acct_Level_UD6"."Six_months_Pure_NIBS_AVG" AS "C11", 
            "F_Monthly_Acct_Level_UD6"."Pure_NIBS_Last_Business_Day_Balance" AS "C12"
        FROM
            "Finance_MIS"."dbo"."D_Account_Details_UD" "Account_Details_UD5"
                INNER JOIN "UpGrade_DownGrade_RBG"
                ON "Account_Details_UD5"."Account_Basic_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                    INNER JOIN "Customer_Details_Month_End"
                    ON "Customer_Details_Month_End"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                        INNER JOIN "Finance_MIS"."dbo"."F_Monthly_Acct_Level_UD" "F_Monthly_Acct_Level_UD6"
                        ON 
                            "F_Monthly_Acct_Level_UD6"."Account_Basic_Number" = "Account_Details_UD5"."Account_Basic_Number" AND
                            "F_Monthly_Acct_Level_UD6"."Account_Branch" = "Account_Details_UD5"."Account_Branch" AND
                            "F_Monthly_Acct_Level_UD6"."Account_Basic_Number" = "Account_Details_UD5"."Account_Basic_Number" AND
                            "F_Monthly_Acct_Level_UD6"."Account_Suffix" = "Account_Details_UD5"."Account_Suffix"
                            LEFT OUTER JOIN "Finance_MIS"."dbo"."D_RBG_Customers_UD" "RBG_Customers_UD7"
                            ON "RBG_Customers_UD7"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number" 
        WHERE 
            NOT ( "Customer_Details_Month_End"."Customer_Branch_Number" IN ( 
                '0820', 
                '0873' ) ) AND
            NOT ( "Account_Details_UD5"."Date_Account_Closed" IS NULL ) AND
            (CASE 
                WHEN "RBG_Customers_UD7"."Customer_Number" <> ' ' THEN 'Y'
                ELSE 'N'
            END = 'Y' OR
            "Customer_Details_Month_End"."Customer_Number_External" <= 750000 OR
            "Customer_Details_Month_End"."Customer_Number_External" > 999999) AND
            "F_Monthly_Acct_Level_UD6"."Pure_NIBS_AVG" > 0 AND
            "UpGrade_DownGrade_RBG"."End_Of_Month_Date" = CAST(DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))))) as DATETIME) AND
            "Account_Details_UD5"."Account_Suffix" IN ( 
                '011', 
                '037', 
                '090', 
                '088', 
                '086', 
                '103', 
                '069', 
                '015', 
                '026', 
                '044', 
                '041', 
                '003', 
                '053', 
                '032', 
                '067', 
                '038', 
                '017', 
                '085', 
                '099', 
                '050', 
                '061', 
                '002', 
                '009', 
                '053', 
                '025', 
                '055', 
                '030', 
                '073', 
                '092', 
                '008', 
                '018', 
                '057', 
                '039', 
                '091', 
                '068', 
                '064', 
                '089', 
                '035', 
                '094', 
                '074', 
                '001', 
                '005', 
                '016', 
                '058', 
                '006', 
                '013', 
                '087', 
                '054', 
                '012', 
                '002', 
                '036', 
                '049', 
                '027', 
                '015', 
                '079', 
                '042', 
                '097', 
                '024', 
                '062', 
                '076', 
                '060', 
                '063', 
                '102', 
                '010', 
                '098', 
                '048', 
                '078', 
                '021', 
                '065', 
                '083', 
                '070', 
                '003', 
                '066', 
                '059', 
                '082', 
                '009', 
                '022', 
                '081', 
                '006', 
                '055', 
                '031', 
                '020', 
                '023', 
                '007', 
                '075', 
                '004', 
                '084', 
                '096', 
                '002', 
                '104', 
                '034', 
                '071', 
                '052', 
                '056', 
                '019', 
                '046', 
                '095', 
                '028', 
                '101', 
                '072', 
                '051', 
                '080', 
                '011', 
                '014', 
                '004', 
                '045', 
                '010', 
                '047', 
                '080', 
                '077', 
                '033', 
                '043', 
                '040', 
                '093', 
                '029', 
                '001' ) AND
            "Customer_Details_Month_End"."Customer_Number" <> 'SADEEM'
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
        "D1"."C12"
    ), 
"Open0" AS 
    (
    SELECT
        "D1"."C0" AS "Branch_Number", 
        "D1"."C1" AS "Customer_number", 
        "D1"."C2" AS "Customer_Number_Internal", 
        "D1"."C3" AS "Customer_Name", 
        "D1"."C4" AS "Account_Basic_Number", 
        "D1"."C5" AS "Account_Suffix", 
        "D1"."C6" AS "Account_Branch", 
        "D1"."C7" AS "Date_Account_Closed", 
        "D1"."C8" AS "Count_Pure_NIBS_Acc", 
        "D1"."C9" AS "Pure_NIBS_AVG_Acc", 
        "D1"."C10" AS "Three_months_Pure_NIBS_AVG_Acc", 
        "D1"."C11" AS "Six_months_Pure_NIBS_AVG_Acc", 
        "D1"."C12" AS "Pure_NIBS_Last_Business_Day_Balance"
    FROM
        (
        SELECT
            "Customer_Details_Month_End"."Customer_Branch_Number" AS "C0", 
            "Customer_Details_Month_End"."Customer_Number_External" AS "C1", 
            "Customer_Details_Month_End"."Customer_Number" AS "C2", 
            replace(replace("Customer_Details_Month_End"."Customer_Name", char(13), ' '), char(10), ' ') AS "C3", 
            "Account_Details_UD"."Account_Basic_Number_External" AS "C4", 
            "Account_Details_UD"."Account_Suffix" AS "C5", 
            "Account_Details_UD"."Account_Branch" AS "C6", 
            "Account_Details_UD"."Date_Account_Closed" AS "C7", 
            "F_Monthly_Acct_Level_UD"."Count_Pure_NIBS" AS "C8", 
            "F_Monthly_Acct_Level_UD"."Pure_NIBS_AVG" AS "C9", 
            "F_Monthly_Acct_Level_UD"."Three_months_Pure_NIBS_AVG" AS "C10", 
            "F_Monthly_Acct_Level_UD"."Six_months_Pure_NIBS_AVG" AS "C11", 
            "F_Monthly_Acct_Level_UD"."Pure_NIBS_Last_Business_Day_Balance" AS "C12"
        FROM
            "Finance_MIS"."dbo"."D_Account_Details_UD" "Account_Details_UD"
                INNER JOIN "UpGrade_DownGrade_RBG"
                ON "Account_Details_UD"."Account_Basic_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                    INNER JOIN "Customer_Details_Month_End"
                    ON "Customer_Details_Month_End"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                        INNER JOIN "Finance_MIS"."dbo"."F_Monthly_Acct_Level_UD" "F_Monthly_Acct_Level_UD"
                        ON 
                            "F_Monthly_Acct_Level_UD"."Account_Basic_Number" = "Account_Details_UD"."Account_Basic_Number" AND
                            "F_Monthly_Acct_Level_UD"."Account_Branch" = "Account_Details_UD"."Account_Branch" AND
                            "F_Monthly_Acct_Level_UD"."Account_Basic_Number" = "Account_Details_UD"."Account_Basic_Number" AND
                            "F_Monthly_Acct_Level_UD"."Account_Suffix" = "Account_Details_UD"."Account_Suffix"
                            LEFT OUTER JOIN "Finance_MIS"."dbo"."D_RBG_Customers_UD" "RBG_Customers_UD"
                            ON "RBG_Customers_UD"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number" 
        WHERE 
            NOT ( "Customer_Details_Month_End"."Customer_Branch_Number" IN ( 
                '0820', 
                '0873' ) ) AND
            "Account_Details_UD"."Date_Account_Closed" IS NULL AND
            (CASE 
                WHEN "RBG_Customers_UD"."Customer_Number" <> ' ' THEN 'Y'
                ELSE 'N'
            END = 'Y' OR
            "Customer_Details_Month_End"."Customer_Number_External" <= 750000 OR
            "Customer_Details_Month_End"."Customer_Number_External" > 999999) AND
            "UpGrade_DownGrade_RBG"."End_Of_Month_Date" = CAST(DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))))) as DATETIME) AND
            "Account_Details_UD"."Account_Suffix" IN ( 
                '011', 
                '037', 
                '090', 
                '088', 
                '086', 
                '103', 
                '069', 
                '015', 
                '026', 
                '044', 
                '041', 
                '003', 
                '053', 
                '032', 
                '067', 
                '038', 
                '017', 
                '085', 
                '099', 
                '050', 
                '061', 
                '002', 
                '009', 
                '053', 
                '025', 
                '055', 
                '030', 
                '073', 
                '092', 
                '008', 
                '018', 
                '057', 
                '039', 
                '091', 
                '068', 
                '064', 
                '089', 
                '035', 
                '094', 
                '074', 
                '001', 
                '005', 
                '016', 
                '058', 
                '006', 
                '013', 
                '087', 
                '054', 
                '012', 
                '002', 
                '036', 
                '049', 
                '027', 
                '015', 
                '079', 
                '042', 
                '097', 
                '024', 
                '062', 
                '076', 
                '060', 
                '063', 
                '102', 
                '010', 
                '098', 
                '048', 
                '078', 
                '021', 
                '065', 
                '083', 
                '070', 
                '003', 
                '066', 
                '059', 
                '082', 
                '009', 
                '022', 
                '081', 
                '006', 
                '055', 
                '031', 
                '020', 
                '023', 
                '007', 
                '075', 
                '004', 
                '084', 
                '096', 
                '002', 
                '104', 
                '034', 
                '071', 
                '052', 
                '056', 
                '019', 
                '046', 
                '095', 
                '028', 
                '101', 
                '072', 
                '051', 
                '080', 
                '011', 
                '014', 
                '004', 
                '045', 
                '010', 
                '047', 
                '080', 
                '077', 
                '033', 
                '043', 
                '040', 
                '093', 
                '029', 
                '001' ) AND
            "Customer_Details_Month_End"."Customer_Number" <> 'SADEEM'
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
        "D1"."C12"
    )
SELECT
    "Union1"."Branch_Number" AS "Branch_Number", 
    "Union1"."Customer_number" AS "Customer_number", 
    "Union1"."Customer_Number_Internal" AS "Customer_Number_Alphanumeric", 
    "Union1"."Customer_Name" AS "Customer_Name", 
    "Union1"."Account_Basic_Number" AS "Account_Basic_Number", 
    "Union1"."Account_Branch" AS "Account_Branch", 
    "Union1"."Account_Suffix" AS "Account_Suffix", 
    "Union1"."Count_Pure_NIBS_Acc" AS "Count_Pure_NIBS", 
    "Union1"."Pure_NIBS_Last_Business_Day_Balance" AS "Pure_NIBS_Last_Business_Day_Balance", 
    "Union1"."Pure_NIBS_AVG_Acc" AS "Pure_NIBS_AVG", 
    "Union1"."Three_months_Pure_NIBS_AVG_Acc" AS "Three_months_Pure_NIBS_AVG", 
    "Union1"."Six_months_Pure_NIBS_AVG_Acc" AS "Six_months_Pure_NIBS_AVG"
FROM
    (
    SELECT
        "Closed"."Branch_Number", 
        "Closed"."Customer_number", 
        "Closed"."Customer_Number_Internal", 
        "Closed"."Customer_Name", 
        "Closed"."Account_Basic_Number", 
        "Closed"."Account_Suffix", 
        "Closed"."Account_Branch", 
        "Closed"."Date_Account_Closed", 
        "Closed"."Count_Pure_NIBS_Acc", 
        "Closed"."Pure_NIBS_AVG_Acc", 
        "Closed"."Three_months_Pure_NIBS_AVG_Acc", 
        "Closed"."Six_months_Pure_NIBS_AVG_Acc", 
        "Closed"."Pure_NIBS_Last_Business_Day_Balance"
    FROM
        "Closed"
    
    UNION
    
    SELECT
        "Open0"."Branch_Number", 
        "Open0"."Customer_number", 
        "Open0"."Customer_Number_Internal", 
        "Open0"."Customer_Name", 
        "Open0"."Account_Basic_Number", 
        "Open0"."Account_Suffix", 
        "Open0"."Account_Branch", 
        "Open0"."Date_Account_Closed", 
        "Open0"."Count_Pure_NIBS_Acc", 
        "Open0"."Pure_NIBS_AVG_Acc", 
        "Open0"."Three_months_Pure_NIBS_AVG_Acc", 
        "Open0"."Six_months_Pure_NIBS_AVG_Acc", 
        "Open0"."Pure_NIBS_Last_Business_Day_Balance"
    FROM
        "Open0"
    ) "Union1"("Branch_Number", "Customer_number", "Customer_Number_Internal", "Customer_Name", "Account_Basic_Number", "Account_Suffix", "Account_Branch", "Date_Account_Closed", "Count_Pure_NIBS_Acc", "Pure_NIBS_AVG_Acc", "Three_months_Pure_NIBS_AVG_Acc", "Six_months_Pure_NIBS_AVG_Acc", "Pure_NIBS_Last_Business_Day_Balance") 
GROUP BY 
    "Union1"."Branch_Number", 
    "Union1"."Customer_number", 
    "Union1"."Customer_Number_Internal", 
    "Union1"."Customer_Name", 
    "Union1"."Account_Basic_Number", 
    "Union1"."Account_Branch", 
    "Union1"."Account_Suffix", 
    "Union1"."Count_Pure_NIBS_Acc", 
    "Union1"."Pure_NIBS_Last_Business_Day_Balance", 
    "Union1"."Pure_NIBS_AVG_Acc", 
    "Union1"."Three_months_Pure_NIBS_AVG_Acc", 
    "Union1"."Six_months_Pure_NIBS_AVG_Acc"
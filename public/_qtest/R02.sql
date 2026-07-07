WITH 
"D_PBG_Customer0" AS 
    (
    SELECT
        "D_PBG_Customer"."Customer_Number" AS "Customer_Number", 
        'Y' AS "PBG Flag"
    FROM
        "Equation_Presentation"."dbo"."D_PBG_Customer" "D_PBG_Customer"
    ), 
"PGB_Customers" AS 
    (
    SELECT
        "D_PBG_Customer0"."Customer_Number" AS "Customer_Number", 
        "D_PBG_Customer0"."PBG Flag" AS "PBG_Flag"
    FROM
        "D_PBG_Customer0"
    )
SELECT
    "D1"."C0" AS "Customer_Branch_Number", 
    "D1"."C1" AS "Customer_Branch_Name", 
    COUNT_BIG(DISTINCT "D1"."C4") AS "Customer_Number", 
    COUNT_BIG(DISTINCT "D1"."C5") AS "Active_customers", 
    COUNT_BIG(DISTINCT "D1"."C4") - COUNT_BIG(DISTINCT "D1"."C5") AS "Inactive_Customers", 
    COUNT_BIG(DISTINCT "D1"."C4") AS "Total_Customer_Number_", 
    COUNT_BIG(DISTINCT "D1"."C4") - COUNT_BIG(DISTINCT "D1"."C5") AS "Total_Inactive_Customers_", 
    COUNT_BIG(DISTINCT "D1"."C5") AS "Total_Active_customers_", 
    'C' AS "Customers", 
    "D1"."C2" AS "RBG_or_Non_RBG", 
    "D1"."C3" AS "Saudi_Or_Non_Saudi"
FROM
    (
    SELECT
        "Customer"."Customer_Branch_Number" AS "C0", 
        "Customer_Branch_Details"."Branch_Finance_Name" AS "C1", 
        CASE 
            WHEN 
                "Customer"."Customer_Type" IN ( 
                    'AP', 
                    'AG', 
                    'AS', 
                    'AT', 
                    'EA', 
                    'EJ', 
                    'ED', 
                    'PB', 
                    'EC' )
                THEN
                    'RBG'
            ELSE 'NON RBG'
        END AS "C2", 
        CASE 
            WHEN "Customer"."Customer_Parent_Country" = 'SA' THEN 'Saudi'
            ELSE 'Non Saudi'
        END AS "C3", 
        "Customer"."Customer_Number_External" AS "C4", 
        CASE 
            WHEN "Account_Details"."Account_Status_Inactive" = 'N' THEN "Customer"."Customer_Number_External"
        END AS "C5"
    FROM
        "Equation_Presentation"."dbo"."D_Branch" "Branch_Details"
            INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details"
            ON "Branch_Details"."Branch_Number" = "Account_Details"."Account_Branch"
                LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated"
                ON "Accounts_Unallocated"."Account_Number" = "Account_Details"."Account_Number"
                    FULL OUTER JOIN 
                    "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details"
                        INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                        ON "Customer_Branch_Details"."Branch_Number" = "Customer"."Customer_Branch_Number"
                    ON "Account_Details"."Customer_Number" = "Customer"."Customer_Number"
                        LEFT OUTER JOIN "PGB_Customers"
                        ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number"
                            LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_RBG_Customers" "RBG_Customers"
                            ON "Customer"."Customer_Number" = "RBG_Customers"."Customer_Number" 
    WHERE 
        "Customer"."Customer_Entry_Date" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
        "Branch_Details"."Branch_Code_1" = 'BH104' AND
        "Account_Details"."Date_Account_Closed" IS NULL AND
        "Account_Details"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
        "Customer_Branch_Details"."Branch_Code_1" = 'BH104' AND
        ("Accounts_Unallocated"."Unallocated_Account_Change_Date" IS NULL OR
        "Accounts_Unallocated"."Type_Description" = 'DORMANT ACCOUNT') AND
        "Account_Details"."Account_Type" <> 'A5' AND
        NOT ( "Customer"."Customer_Number_External" LIKE '%SADEEM%' ) AND
        CASE 
            WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
            ELSE 'N'
        END <> 'Y' AND
        (CASE 
            WHEN "RBG_Customers"."Customer_Number" <> ' ' THEN 'Y'
            ELSE 'N'
        END = 'Y' OR
        "Customer"."Customer_Number_External" <= 750000 OR
        "Customer"."Customer_Number_External" > 999999) AND
        "Customer"."Customer_Type" <> 'PC'
    ) "D1" 
GROUP BY 
    "D1"."C0", 
    "D1"."C1", 
    "D1"."C2", 
    "D1"."C3" 
ORDER BY 
    "Customer_Branch_Number" ASC
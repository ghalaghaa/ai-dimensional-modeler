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
    ), 
"Accounts__CA_CE_" AS 
    (
    SELECT
        '(CA, CE)' AS "Name", 
        1 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C5") AS "Account_Number", 
        "D1"."C2" AS "Act_Inact", 
        "D1"."C3" AS "RBG_or_Non_RBG", 
        "D1"."C4" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details5"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details5"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details5"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details7"."Branch_Finance_Name"
                ELSE "Branch_Details4"."Branch_Finance_Name"
            END AS "C1", 
            "Account_Details5"."Account_Status_Inactive" AS "C2", 
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
            END AS "C3", 
            CASE 
                WHEN "Customer"."Customer_Parent_Country" = 'SA' THEN 'Saudi'
                ELSE 'Non Saudi'
            END AS "C4", 
            "Account_Details5"."Account_Number_External" AS "C5"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details4"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details5"
                ON "Branch_Details4"."Branch_Number" = "Account_Details5"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated6"
                    ON "Accounts_Unallocated6"."Account_Number" = "Account_Details5"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details7"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details7"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details5"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details5"."Account_Type" IN ( 
                'CA', 
                'CE' ) AND
            "Account_Details5"."Date_Account_Closed" IS NULL AND
            "Account_Details5"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details5"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details4"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated6"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated6"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3", 
        "D1"."C4"
    ), 
"Accounts__CJ_JA_CF_CI_EI_" AS 
    (
    SELECT
        'CJ JA CF CI EI' AS "Name", 
        2 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C5") AS "Account_Number", 
        "D1"."C2" AS "Act_Inact", 
        "D1"."C3" AS "RBG_or_Non_RBG", 
        "D1"."C4" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details11"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details11"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details11"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details13"."Branch_Finance_Name"
                ELSE "Branch_Details10"."Branch_Finance_Name"
            END AS "C1", 
            "Account_Details11"."Account_Status_Inactive" AS "C2", 
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
            END AS "C3", 
            CASE 
                WHEN "Customer"."Customer_Parent_Country" = 'SA' THEN 'Saudi'
                ELSE 'Non Saudi'
            END AS "C4", 
            "Account_Details11"."Account_Number_External" AS "C5"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details10"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details11"
                ON "Branch_Details10"."Branch_Number" = "Account_Details11"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated12"
                    ON "Accounts_Unallocated12"."Account_Number" = "Account_Details11"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details13"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details13"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details11"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details11"."Account_Type" IN ( 
                'CJ', 
                'JA', 
                'CF', 
                'CI', 
                'EI' ) AND
            "Account_Details11"."Date_Account_Closed" IS NULL AND
            "Account_Details11"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details11"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details10"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated12"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated12"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3", 
        "D1"."C4"
    ), 
"Dinar" AS 
    (
    SELECT
        'DINAR' AS "Name", 
        6 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'DINAR' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details17"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details17"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details17"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details19"."Branch_Finance_Name"
                ELSE "Branch_Details16"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details17"."Account_Number_External" AS "C4"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details16"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details17"
                ON "Branch_Details16"."Branch_Number" = "Account_Details17"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated18"
                    ON "Accounts_Unallocated18"."Account_Number" = "Account_Details17"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details19"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details19"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details17"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details17"."Account_Type" IN ( 
                'II', 
                'IG', 
                'IF', 
                'IZ', 
                ' IM', 
                'ID', 
                'IE', 
                'IP', 
                'IW', 
                'LI', 
                'OO', 
                'OQ', 
                'OP', 
                'KA', 
                'KB', 
                'I1', 
                'I3', 
                'I4', 
                'I6', 
                'I7', 
                'I8', 
                'I9' ) AND
            "Account_Details17"."Balance_Last_Business_Day" <> 0 AND
            "Account_Details17"."Date_Account_Closed" IS NULL AND
            "Account_Details17"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details17"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details16"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated18"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated18"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    ), 
"NAQA" AS 
    (
    SELECT
        'NAQA' AS "Name", 
        5 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'DINAR' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details23"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details23"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details23"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details25"."Branch_Finance_Name"
                ELSE "Branch_Details22"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details23"."Account_Number_External" AS "C4"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details22"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details23"
                ON "Branch_Details22"."Branch_Number" = "Account_Details23"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated24"
                    ON "Accounts_Unallocated24"."Account_Number" = "Account_Details23"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details25"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details25"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details23"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details23"."Account_Type" IN ( 
                'NQ', 
                'NL' ) AND
            "Account_Details23"."Balance_Last_Business_Day" <> 0 AND
            "Account_Details23"."Date_Account_Closed" IS NULL AND
            "Account_Details23"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details23"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details22"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated24"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated24"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    ), 
"Payroll" AS 
    (
    SELECT
        'Payroll' AS "Name", 
        9 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'Payroll' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details29"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details29"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details29"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details31"."Branch_Finance_Name"
                ELSE "Branch_Details28"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details29"."Account_Number_External" AS "C4"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details28"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details29"
                ON "Branch_Details28"."Branch_Number" = "Account_Details29"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated30"
                    ON "Accounts_Unallocated30"."Account_Number" = "Account_Details29"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details31"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details31"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details29"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details29"."Account_Type" IN ( 
                'C5', 
                'K3' ) AND
            "Account_Details29"."Balance_Last_Business_Day" <> 0 AND
            "Account_Details29"."Date_Account_Closed" IS NULL AND
            "Account_Details29"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details29"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details28"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated30"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated30"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    ), 
"Real_Estate" AS 
    (
    SELECT
        'Real Estate' AS "Name", 
        7 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'Real Estate' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details35"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details35"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details35"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details37"."Branch_Finance_Name"
                ELSE "Branch_Details34"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details35"."Account_Number_External" AS "C4"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details34"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details35"
                ON "Branch_Details34"."Branch_Number" = "Account_Details35"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated36"
                    ON "Accounts_Unallocated36"."Account_Number" = "Account_Details35"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details37"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details37"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details35"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details35"."Account_Type" IN ( 
                'IN', 
                'IT', 
                'IH', 
                'IQ', 
                'IJ', 
                'IR', 
                'IU', 
                'OK', 
                'OL', 
                'OA', 
                'OB', 
                'OC', 
                'OD', 
                'OE', 
                'OF', 
                'OG', 
                'OH', 
                'OI' ) AND
            "Account_Details35"."Balance_Last_Business_Day" <> 0 AND
            "Account_Details35"."Date_Account_Closed" IS NULL AND
            "Account_Details35"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details35"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details34"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated36"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated36"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    ), 
"Savings__EA_EB_EC_" AS 
    (
    SELECT
        'EA EB EC ' AS "Name", 
        4 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'EA EB EC ' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details41"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details41"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details41"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details43"."Branch_Finance_Name"
                ELSE "Branch_Details40"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details41"."Account_Number_External" AS "C4"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details40"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details41"
                ON "Branch_Details40"."Branch_Number" = "Account_Details41"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated42"
                    ON "Accounts_Unallocated42"."Account_Number" = "Account_Details41"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details43"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details43"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details41"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details41"."Account_Type" IN ( 
                'EA', 
                'EB', 
                'EC' ) AND
            "Account_Details41"."Date_Account_Closed" IS NULL AND
            "Account_Details41"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details41"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details40"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated42"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated42"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    ), 
"Secure_Lending" AS 
    (
    SELECT
        'Secure Lending' AS "Name", 
        8 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'Secure Lending' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details47"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details47"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details47"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details49"."Branch_Finance_Name"
                ELSE "Branch_Details46"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details47"."Account_Number_External" AS "C4"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details46"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details47"
                ON "Branch_Details46"."Branch_Number" = "Account_Details47"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated48"
                    ON "Accounts_Unallocated48"."Account_Number" = "Account_Details47"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details49"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details49"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details47"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details47"."Account_Type" IN ( 
                'IO', 
                'IY', 
                'IX' ) AND
            "Account_Details47"."Balance_Last_Business_Day" <> 0 AND
            "Account_Details47"."Date_Account_Closed" IS NULL AND
            "Account_Details47"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details47"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details46"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated48"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated48"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    ), 
"Staff" AS 
    (
    SELECT
        'Staff' AS "Name", 
        11 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'Staff' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details53"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details53"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details53"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details55"."Branch_Finance_Name"
                ELSE "Branch_Details52"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details53"."Account_Number_External" AS "C4"
        FROM
            "Equation_Presentation"."dbo"."D_Branch" "Branch_Details52"
                INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details53"
                ON "Branch_Details52"."Branch_Number" = "Account_Details53"."Account_Branch"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Accounts_Unallocated" "Accounts_Unallocated54"
                    ON "Accounts_Unallocated54"."Account_Number" = "Account_Details53"."Account_Number"
                        FULL OUTER JOIN 
                        "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details55"
                            INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                            ON "Customer_Branch_Details55"."Branch_Number" = "Customer"."Customer_Branch_Number"
                        ON "Account_Details53"."Customer_Number" = "Customer"."Customer_Number"
                            LEFT OUTER JOIN "PGB_Customers"
                            ON "Customer"."Customer_Number_External" = "PGB_Customers"."Customer_Number" 
        WHERE 
            "Account_Details53"."Account_Customer_Type" IN ( 
                'AS', 
                'AT', 
                'EC' ) AND
            "Account_Details53"."Balance_Last_Business_Day" <> 0 AND
            "Account_Details53"."Date_Account_Closed" IS NULL AND
            "Account_Details53"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details53"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details52"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated54"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated54"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    ), 
"Total___CJ_JA_CF_CI_EI_" AS 
    (
    SELECT
        'Total CJ JA CF CI EI' AS "Name", 
        3 AS "Sort", 
        "D1"."C0" AS "Customer_Branch_Number", 
        "D1"."C1" AS "Customer_Branch_Mnemonic", 
        COUNT_BIG(DISTINCT "D1"."C4") AS "Account_Number", 
        'Total CJ JA CF CI EI' AS "Act_Inact", 
        "D1"."C2" AS "RBG_or_Non_RBG", 
        "D1"."C3" AS "Saudi_Or_Non_Saudi"
    FROM
        (
        SELECT
            CASE 
                WHEN "Account_Details"."Economic_Sector_Code" = 'LB' THEN "Customer"."Customer_Branch_Number"
                ELSE "Account_Details"."Account_Branch"
            END AS "C0", 
            CASE 
                WHEN "Account_Details"."Economic_Sector_Code" = 'LB' THEN "Customer_Branch_Details"."Branch_Finance_Name"
                ELSE "Branch_Details"."Branch_Finance_Name"
            END AS "C1", 
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
            "Account_Details"."Account_Number_External" AS "C4"
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
        WHERE 
            "Account_Details"."Account_Type" IN ( 
                'CJ', 
                'JA', 
                'CF', 
                'CI', 
                'EI', 
                'CA', 
                'CE' ) AND
            "Account_Details"."Date_Account_Closed" IS NULL AND
            "Account_Details"."Internal_Non_Customer_Account_Flag" <> 'Y' AND
            "Account_Details"."Date_Account_Opened" <= CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "Branch_Details"."Branch_Code_1" = 'BH104' AND
            ("Accounts_Unallocated"."Unallocated_Account_Change_Date" IS NULL OR
            "Accounts_Unallocated"."Type_Description" = 'DORMANT ACCOUNT') AND
            CASE 
                WHEN "PGB_Customers"."PBG_Flag" = 'Y' THEN 'Y'
                ELSE 'N'
            END <> 'Y'
        ) "D1" 
    GROUP BY 
        "D1"."C0", 
        "D1"."C1", 
        "D1"."C2", 
        "D1"."C3"
    )
SELECT
    "Union1"."Name" AS "Name", 
    "Union1"."Sort" AS "Sort", 
    "Union1"."Customer_Branch_Number" AS "Customer_Branch_Number", 
    "Union1"."Customer_Branch_Mnemonic" AS "Customer_Branch_Mnemonic", 
    SUM("Union1"."Account_Number") AS "Account_Number", 
    "Union1"."RBG_or_Non_RBG" AS "RBG_or_Non_RBG", 
    "Union1"."Saudi_Or_Non_Saudi" AS "Saudi_Or_Non_Saudi", 
    "Union1"."Act_Inact" AS "Act_Inact", 
    'Total' AS "Total", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" = 1 AND
                "Union1"."Act_Inact" = 'N'
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "CA_CE_1", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" = 1 AND
                "Union1"."Act_Inact" = 'Y'
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "CA_CE_2", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" = 2 AND
                "Union1"."Act_Inact" = 'N'
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "C_CJ___JA___CF___CI___EI__1", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" = 2 AND
                "Union1"."Act_Inact" = 'Y'
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "C_CJ___JA___CF___CI___EI__2", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    3 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "Total_Current_Accs__3", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    4 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "Saving_4", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    5 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "NAQA_5", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    6 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "DINAR_6", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    7 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "Real_Estate_7", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    8 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "Secured_Lending_8", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    9 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "Payroll_9", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    3, 
                    4, 
                    5, 
                    6, 
                    7, 
                    8, 
                    9 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "Total_Retail__10", 
    SUM(
        CASE 
            WHEN 
                "Union1"."Sort" IN ( 
                    11 )
                THEN
                    "Union1"."Account_Number"
            ELSE 0
        END) AS "Staff_11", 
    SUM(CASE 
        WHEN 
            "Union1"."Sort" IN ( 
                3, 
                4, 
                5, 
                6, 
                7, 
                8, 
                9 )
            THEN
                "Union1"."Account_Number"
        ELSE 0
    END + CASE 
        WHEN 
            "Union1"."Sort" IN ( 
                11 )
            THEN
                "Union1"."Account_Number"
        ELSE 0
    END) AS "Total_All_12", 
    'A' AS "Accounts"
FROM
    (
    SELECT
        "Accounts__CA_CE_"."Name", 
        "Accounts__CA_CE_"."Sort", 
        "Accounts__CA_CE_"."Customer_Branch_Number", 
        "Accounts__CA_CE_"."Customer_Branch_Mnemonic", 
        "Accounts__CA_CE_"."Account_Number", 
        "Accounts__CA_CE_"."Act_Inact", 
        "Accounts__CA_CE_"."RBG_or_Non_RBG", 
        "Accounts__CA_CE_"."Saudi_Or_Non_Saudi"
    FROM
        "Accounts__CA_CE_"
    
    UNION
    
    SELECT
        "Accounts__CJ_JA_CF_CI_EI_"."Name", 
        "Accounts__CJ_JA_CF_CI_EI_"."Sort", 
        "Accounts__CJ_JA_CF_CI_EI_"."Customer_Branch_Number", 
        "Accounts__CJ_JA_CF_CI_EI_"."Customer_Branch_Mnemonic", 
        "Accounts__CJ_JA_CF_CI_EI_"."Account_Number", 
        "Accounts__CJ_JA_CF_CI_EI_"."Act_Inact", 
        "Accounts__CJ_JA_CF_CI_EI_"."RBG_or_Non_RBG", 
        "Accounts__CJ_JA_CF_CI_EI_"."Saudi_Or_Non_Saudi"
    FROM
        "Accounts__CJ_JA_CF_CI_EI_"
    
    UNION
    
    SELECT
        "Total___CJ_JA_CF_CI_EI_"."Name", 
        "Total___CJ_JA_CF_CI_EI_"."Sort", 
        "Total___CJ_JA_CF_CI_EI_"."Customer_Branch_Number", 
        "Total___CJ_JA_CF_CI_EI_"."Customer_Branch_Mnemonic", 
        "Total___CJ_JA_CF_CI_EI_"."Account_Number", 
        "Total___CJ_JA_CF_CI_EI_"."Act_Inact", 
        "Total___CJ_JA_CF_CI_EI_"."RBG_or_Non_RBG", 
        "Total___CJ_JA_CF_CI_EI_"."Saudi_Or_Non_Saudi"
    FROM
        "Total___CJ_JA_CF_CI_EI_"
    
    UNION
    
    SELECT
        "Savings__EA_EB_EC_"."Name", 
        "Savings__EA_EB_EC_"."Sort", 
        "Savings__EA_EB_EC_"."Customer_Branch_Number", 
        "Savings__EA_EB_EC_"."Customer_Branch_Mnemonic", 
        "Savings__EA_EB_EC_"."Account_Number", 
        "Savings__EA_EB_EC_"."Act_Inact", 
        "Savings__EA_EB_EC_"."RBG_or_Non_RBG", 
        "Savings__EA_EB_EC_"."Saudi_Or_Non_Saudi"
    FROM
        "Savings__EA_EB_EC_"
    
    UNION
    
    SELECT
        "NAQA"."Name", 
        "NAQA"."Sort", 
        "NAQA"."Customer_Branch_Number", 
        "NAQA"."Customer_Branch_Mnemonic", 
        "NAQA"."Account_Number", 
        "NAQA"."Act_Inact", 
        "NAQA"."RBG_or_Non_RBG", 
        "NAQA"."Saudi_Or_Non_Saudi"
    FROM
        "NAQA"
    
    UNION
    
    SELECT
        "Dinar"."Name", 
        "Dinar"."Sort", 
        "Dinar"."Customer_Branch_Number", 
        "Dinar"."Customer_Branch_Mnemonic", 
        "Dinar"."Account_Number", 
        "Dinar"."Act_Inact", 
        "Dinar"."RBG_or_Non_RBG", 
        "Dinar"."Saudi_Or_Non_Saudi"
    FROM
        "Dinar"
    
    UNION
    
    SELECT
        "Real_Estate"."Name", 
        "Real_Estate"."Sort", 
        "Real_Estate"."Customer_Branch_Number", 
        "Real_Estate"."Customer_Branch_Mnemonic", 
        "Real_Estate"."Account_Number", 
        "Real_Estate"."Act_Inact", 
        "Real_Estate"."RBG_or_Non_RBG", 
        "Real_Estate"."Saudi_Or_Non_Saudi"
    FROM
        "Real_Estate"
    
    UNION
    
    SELECT
        "Secure_Lending"."Name", 
        "Secure_Lending"."Sort", 
        "Secure_Lending"."Customer_Branch_Number", 
        "Secure_Lending"."Customer_Branch_Mnemonic", 
        "Secure_Lending"."Account_Number", 
        "Secure_Lending"."Act_Inact", 
        "Secure_Lending"."RBG_or_Non_RBG", 
        "Secure_Lending"."Saudi_Or_Non_Saudi"
    FROM
        "Secure_Lending"
    
    UNION
    
    SELECT
        "Payroll"."Name", 
        "Payroll"."Sort", 
        "Payroll"."Customer_Branch_Number", 
        "Payroll"."Customer_Branch_Mnemonic", 
        "Payroll"."Account_Number", 
        "Payroll"."Act_Inact", 
        "Payroll"."RBG_or_Non_RBG", 
        "Payroll"."Saudi_Or_Non_Saudi"
    FROM
        "Payroll"
    
    UNION
    
    SELECT
        "Staff"."Name", 
        "Staff"."Sort", 
        "Staff"."Customer_Branch_Number", 
        "Staff"."Customer_Branch_Mnemonic", 
        "Staff"."Account_Number", 
        "Staff"."Act_Inact", 
        "Staff"."RBG_or_Non_RBG", 
        "Staff"."Saudi_Or_Non_Saudi"
    FROM
        "Staff"
    ) "Union1"("Name", "Sort", "Customer_Branch_Number", "Customer_Branch_Mnemonic", "Account_Number", "Act_Inact", "RBG_or_Non_RBG", "Saudi_Or_Non_Saudi") 
WHERE 
    "Union1"."Customer_Branch_Number" <> '?' AND
    NOT ( "Union1"."Customer_Branch_Number" IN ( 
        '0840', 
        '0842', 
        '0987' ) ) 
GROUP BY 
    "Union1"."Name", 
    "Union1"."Sort", 
    "Union1"."Customer_Branch_Number", 
    "Union1"."Customer_Branch_Mnemonic", 
    "Union1"."RBG_or_Non_RBG", 
    "Union1"."Saudi_Or_Non_Saudi", 
    "Union1"."Act_Inact"
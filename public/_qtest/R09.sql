SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Regional_Centre_Branch", 
    "Branch"."Branch_Level_4", 
    "Branch"."Branch_Finance_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    "AJT_Branch_Balances10"."Branch_Number", 
    CAST(CONVERT(CHAR(10), CAST("AJT_Branch_Balances10"."Account_Balance_Date" AS DATE), 121) AS VARCHAR(20)), 
    "AJT_Branch_Balances10"."Account_Balance_Date", 
    year("AJT_Branch_Balances10"."Account_Balance_Date"), 
    month("AJT_Branch_Balances10"."Account_Balance_Date"), 
    CASE month("AJT_Branch_Balances10"."Account_Balance_Date")
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
    END, 
    "AJT_Branch_Balances10"."Balance"
FROM
    "Finance_MIS"."dbo"."F_AJT_Branch_Balances" "AJT_Branch_Balances10" 
WHERE 
    "AJT_Branch_Balances10"."Account_Balance_Date" = CAST(CAST( (DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)))) + 1, DATEADD(MONTH, -1, DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))))))) AS DATE ) as DATETIME)

SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Regional_Centre_Branch", 
    "Branch"."Branch_Level_4", 
    "Branch"."Branch_Finance_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    "AJT_Branch_Balances4"."Branch_Number", 
    CAST(CONVERT(CHAR(10), CAST("AJT_Branch_Balances4"."Account_Balance_Date" AS DATE), 121) AS VARCHAR(20)), 
    "AJT_Branch_Balances4"."Account_Balance_Date", 
    year("AJT_Branch_Balances4"."Account_Balance_Date"), 
    month("AJT_Branch_Balances4"."Account_Balance_Date"), 
    CASE month("AJT_Branch_Balances4"."Account_Balance_Date")
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
    END, 
    "AJT_Branch_Balances4"."Balance"
FROM
    "Finance_MIS"."dbo"."F_AJT_Branch_Balances" "AJT_Branch_Balances4" 
WHERE 
    year("AJT_Branch_Balances4"."Account_Balance_Date") = year(DATEADD(DAY, -1, getdate())) AND
    month("AJT_Branch_Balances4"."Account_Balance_Date") = month(DATEADD(DAY, -1, getdate()))

SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Regional_Centre_Branch", 
    "Branch"."Branch_Level_4", 
    "Branch"."Branch_Finance_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    "AJT_AVG_Branch_Balances"."Branch_Number", 
    "AJT_AVG_Branch_Balances"."Account_Balance_Date", 
    year("AJT_AVG_Branch_Balances"."Account_Balance_Date"), 
    month("AJT_AVG_Branch_Balances"."Account_Balance_Date"), 
    CASE month("AJT_AVG_Branch_Balances"."Account_Balance_Date")
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
    END, 
    "AJT_AVG_Branch_Balances"."AVG_Balance"
FROM
    "Finance_MIS"."dbo"."F_AJT_AVG_Branch_Balances" "AJT_AVG_Branch_Balances" 
WHERE 
    "AJT_AVG_Branch_Balances"."Account_Balance_Date" = CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
    Year("AJT_AVG_Branch_Balances"."Account_Balance_Date") = Year(DATEADD(DAY, -1, getdate()))

SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Regional_Centre_Branch", 
    "Branch"."Branch_Level_4", 
    "Branch"."Branch_Finance_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    "AJT_Branch_Balances13"."Branch_Number", 
    "AJT_Branch_Balances13"."Account_Balance_Date", 
    year("AJT_Branch_Balances13"."Account_Balance_Date"), 
    month("AJT_Branch_Balances13"."Account_Balance_Date"), 
    CASE month("AJT_Branch_Balances13"."Account_Balance_Date")
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
    END, 
    "AJT_Branch_Balances13"."Balance"
FROM
    "Finance_MIS"."dbo"."F_AJT_Branch_Balances" "AJT_Branch_Balances13" 
WHERE 
    month("AJT_Branch_Balances13"."Account_Balance_Date") = 12 AND
    year("AJT_Branch_Balances13"."Account_Balance_Date") = year(DATEADD(YEAR, -1, DATEADD(DAY, -1, getdate())))

SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Regional_Centre_Branch", 
    "Branch"."Branch_Level_4", 
    "Branch"."Branch_Finance_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    "AJT_Branch_Balances16"."Branch_Number", 
    "AJT_Branch_Balances16"."Account_Balance_Date", 
    year("AJT_Branch_Balances16"."Account_Balance_Date"), 
    month("AJT_Branch_Balances16"."Account_Balance_Date"), 
    CASE month("AJT_Branch_Balances16"."Account_Balance_Date")
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
    END, 
    "AJT_Branch_Balances16"."Balance"
FROM
    "Finance_MIS"."dbo"."F_AJT_Branch_Balances" "AJT_Branch_Balances16" 
WHERE 
    month("AJT_Branch_Balances16"."Account_Balance_Date") = month(DATEADD(YEAR, -1, DATEADD(DAY, -1, getdate()))) AND
    year("AJT_Branch_Balances16"."Account_Balance_Date") = year(DATEADD(YEAR, -1, DATEADD(DAY, -1, getdate())))

SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Regional_Centre_Branch", 
    "Branch"."Branch_Level_4", 
    "Branch"."Branch_Finance_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    "AJT_Branch_Balances"."Branch_Number", 
    DATEADD(DAY, -1, getdate()), 
    year(DATEADD(DAY, -1, getdate())), 
    month(DATEADD(DAY, -1, getdate())), 
    CASE month(DATEADD(DAY, -1, getdate()))
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
    END, 
    "AJT_Branch_Balances"."Balance"
FROM
    "Finance_MIS"."dbo"."F_AJT_Branch_Balances" "AJT_Branch_Balances" 
WHERE 
    year("AJT_Branch_Balances"."Account_Balance_Date") = year(DATEADD(DAY, -1, getdate())) AND
    "AJT_Branch_Balances"."Account_Balance_Date" <= DATEADD(DAY, -1, getdate())

SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Regional_Centre_Branch", 
    "Branch"."Branch_Level_4", 
    "Branch"."Branch_Finance_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    "AJT_Branch_Balances7"."Branch_Number", 
    "AJT_Branch_Balances7"."Account_Balance_Date", 
    year("AJT_Branch_Balances7"."Account_Balance_Date"), 
    month("AJT_Branch_Balances7"."Account_Balance_Date"), 
    CASE month("AJT_Branch_Balances7"."Account_Balance_Date")
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
    END, 
    CASE 
        WHEN "AJT_Branch_Balances7"."Account_Balance_Date" = CAST(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) THEN "AJT_Branch_Balances7"."Balance"
        ELSE 0
    END - CASE 
        WHEN "AJT_Branch_Balances7"."Account_Balance_Date" = CAST(DATEADD(DAY, -2, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) THEN "AJT_Branch_Balances7"."Balance"
        ELSE 0
    END
FROM
    "Finance_MIS"."dbo"."F_AJT_Branch_Balances" "AJT_Branch_Balances7" 
WHERE 
    "AJT_Branch_Balances7"."Account_Balance_Date" >= CAST(CAST( (DATEADD(DAY, -2, CAST(CURRENT_TIMESTAMP AS DATE))) AS DATE ) as DATETIME)
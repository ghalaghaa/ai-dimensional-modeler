SELECT
    "Account_Details"."Account_Number_External" AS "Account_Number", 
    SUM("Account_Details"."Balance_Last_Business_Day") AS "Balance_Last_Business_Day", 
    COUNT_BIG("Account_Details"."Account_Number_External") AS "count0"
FROM
    "Equation_Presentation"."dbo"."D_Account" "Account_Details" 
WHERE 
    "Account_Details"."Account_Type" = 'AS' 
GROUP BY 
    "Account_Details"."Account_Number_External"
\c biztime_db

DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS company_industries;


CREATE TABLE industries (
    code VARCHAR(255) PRIMARY KEY,
    industry_name text NOT NULL UNIQUE
);

CREATE TABLE company_industries (
    company_code VARCHAR(255) REFERENCES companies(code),
    industry_code VARCHAR(255) REFERENCES industries(code),
    PRIMARY KEY (company_code, industry_code)
);

-- Insert sample data into industries table
INSERT INTO industries (code, industry_name)
VALUES 
    ('tech', 'Technology'),
    ('fin', 'Finance'),
    ('med', 'Medical'),
    ('manu', 'Manufacturing');

-- Add an industry_code column to the companies table
ALTER TABLE companies
ADD COLUMN industry_code text REFERENCES industries(code);

-- Update companies with sample industry codes
UPDATE companies
SET industry_code = 'tech'
WHERE code = 'apple';

UPDATE companies
SET industry_code = 'fin'
WHERE code = 'ibm';
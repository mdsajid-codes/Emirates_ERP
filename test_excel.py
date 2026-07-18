import requests
import io
import openpyxl

url = "http://localhost:8080/api/accounts/reports/trial-balance/export/excel"
headers = {"Authorization": "Bearer " + open("token.txt").read().strip()}
res = requests.get(url, headers=headers)
with open("test.xlsx", "wb") as f:
    f.write(res.content)
try:
    wb = openpyxl.load_workbook(filename=io.BytesIO(res.content))
    print("Excel is valid")
except Exception as e:
    print("Excel is corrupted:", e)

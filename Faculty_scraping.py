import requests
from bs4 import BeautifulSoup
import pandas as pd

url = "https://www.gju.edu.jo/content/faculty-directory-14469"  # Replace with any directory
headers = {'User-Agent': 'Mozilla/5.0'}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.content, "html.parser")

entries = []
page_link = url

'''
this script is written for known facilties and cannot provide the relevant departments.
for future work, we can change the url from the faculty to department and then by using the department image (/html/body/div[3]/div/aside/div/div/section/div/div/div/div/span/a/img).
the proposed solution needs to format the link and only get the department's name. 
'''
for faculty in soup.find_all("div", class_="views-row"):
    name_tag = faculty.find("div", class_="views-field-title")
    email_tag = faculty.find("a", href=lambda x: x and x.startswith("mailto:"))
    phone = faculty.find("div", class_="faculty-telphone")
    office = faculty.find("div", class_="faculty-office")
    #dept = faculty.find("div", class_="views-field-field-department")
    school = "Electrical Engineering and Information Technology (SEEIT)"
    name = ""
    if name_tag:
        name = name_tag.get_text(strip=True).replace('’', "'")

    
    email = ""
    if email_tag:
        # Extract actual email from the href
        email = email_tag['href'].replace("mailto:", "").replace("%40", "@")

    name = name_tag.get_text(strip=True).replace('’', "'").replace("Name ", "") if name_tag else ""

    if not name:
        continue
    entries.append({
        "name": name.replace("Name ", "") if name else "",
        "email": email if email else "No email available on gju.edu.com",
        "phone": phone.get_text(strip=True).replace("Phone ", "") if phone else "",
        "office": office.get_text(strip=True).replace("Office ", "") if office else "No office available on gju.edu.com",
        "faculty": "School of Electrical Engineering and Information Technology (SEEIT)",
        #"department": dept.get_text(strip=True).replace("Department ", "") if dept else "",
        "page_link": page_link
    })


df = pd.DataFrame(entries)
df.to_csv("src/data/professors/professors.json", index=False)
#print("Saved to gju_faculty_directory_flat.csv")

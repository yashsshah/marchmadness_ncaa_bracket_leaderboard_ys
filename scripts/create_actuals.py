import openpyxl
from openpyxl.styles import Font

wb = openpyxl.Workbook()

# ============ SHEET 1: BRACKET FORMAT (matches Pick Template layout) ============
ws = wb.active
ws.title = "Actual Results"

ws['A1'] = 'NCAA 2026 Tournament'
ws['A1'].font = Font(bold=True, size=14)
ws['A3'] = 'Actual Results'
ws['B3'] = '2026 NCAA Actual Results'
ws['A3'].font = Font(bold=True)

# ---- TOP HALF: EAST (left) & WEST (right), Rows 5-20 ----

# Seed labels Column A (East)
east_labels = {
    5:'(1) Duke', 6:'(16) Sienna', 7:'(8) Ohio St.', 8:'(9) TCU',
    9:'(5) St. Johns', 10:'(12) Northern Iowa', 11:'(4) Kansas', 12:'(13) Cal Baptist',
    13:'(6) Louisville', 14:'(11) South Florida', 15:'(3) Michigan State', 16:'(14) North Dakota St.',
    17:'(7) UCLA', 18:'(10) UCF', 19:'(2) UConn', 20:'(15) Furman'
}
# Seed labels Column M (West)
west_labels = {
    5:'(1) Arizona', 6:'(16) Long Island', 7:'(8) Villanova', 8:'(9) Utah St.',
    9:'(5) Wisconsin', 10:'(12) High Point', 11:'(4) Arkansas', 12:'(13) Hawaii',
    13:'(6) BYU', 14:'(11) TX / NC St.', 15:'(3) Gonzaga', 16:'(14) Kennesaw St.',
    17:'(7) Miami (Florida)', 18:'(10) Missouri', 19:'(2) Purdue', 20:'(15) Queens (NC)'
}
for r, v in east_labels.items():
    ws.cell(row=r, column=1, value=v)
for r, v in west_labels.items():
    ws.cell(row=r, column=13, value=v)

# East R64 winners (Col B)
for r, v in {5:'Duke', 7:'TCU', 9:'St Johns', 11:'Kansas',
             13:'Louisville', 15:'Michigan State', 17:'UCLA', 19:'UConn'}.items():
    ws.cell(row=r, column=2, value=v)

# East R32 winners (Col C)
for r, v in {5:'Duke', 9:'St Johns', 13:'Michigan State', 17:'UConn'}.items():
    ws.cell(row=r, column=3, value=v)

# East S16 winners (Col D)
for r, v in {5:'Duke', 13:'UConn'}.items():
    ws.cell(row=r, column=4, value=v)

# East E8 winner (Col E)
ws.cell(row=5, column=5, value='UConn')

# Final Four winners
ws.cell(row=5, column=6, value='UConn')
ws.cell(row=5, column=8, value='Michigan')

# West R64 winners (Col L = 12)
for r, v in {5:'Arizona', 7:'Utah St', 9:'High Point', 11:'Arkansas',
             13:'Texas', 15:'Gonzaga', 17:'Miami (FL)', 19:'Purdue'}.items():
    ws.cell(row=r, column=12, value=v)

# West R32 winners (Col K = 11)
for r, v in {5:'Arizona', 9:'Arkansas', 11:'Arizona', 13:'Texas', 17:'Purdue'}.items():
    ws.cell(row=r, column=11, value=v)

# West S16 winners (Col J = 10)
for r, v in {5:'Arizona', 13:'Purdue'}.items():
    ws.cell(row=r, column=10, value=v)

# West E8 winner (Col I = 9)
ws.cell(row=5, column=9, value='Arizona')


# ---- BOTTOM HALF: SOUTH (left) & MIDWEST (right), Rows 24-39 ----

south_labels = {
    24:'(1) Florida', 25:'(16) PV A&M/Lehigh', 26:'(8) Clemson', 27:'(9) Iowa',
    28:'(5) Vanderbilt', 29:'(12) Mc Neese', 30:'(4) Nebraska', 31:'(13) Troy',
    32:'(6) North Carolina', 33:'(11) VCU', 34:'(3) Illinois', 35:'(14) Penn',
    36:"(7) St. Mary's", 37:'(10) Texas A&M', 38:'(2) Houston', 39:'(15) Idaho'
}
midwest_labels = {
    24:'(1) Michigan', 25:'(16) UMBC / Howard', 26:'(8) Georgia', 27:'(9) St. Louis',
    28:'(5) Texas Tech', 29:'(12) Akron', 30:'(4) Alabama', 31:'(13) Hofstra',
    32:'(6) Tennessee', 33:'(11) Miami (OH) / SMU', 34:'(3) Virginia', 35:'(14) Wright St.',
    36:'(7) Kentucky', 37:'(10) Santa Clara', 38:'(2) Iowa St.', 39:'(15) Tennessee St.'
}
for r, v in south_labels.items():
    ws.cell(row=r, column=1, value=v)
for r, v in midwest_labels.items():
    ws.cell(row=r, column=13, value=v)

# South R64 (Col B)
for r, v in {24:'Florida', 26:'Iowa', 28:'Vanderbilt', 30:'Nebraska',
             32:'VCU', 34:'Illinois', 36:'Texas A&M', 38:'Houston'}.items():
    ws.cell(row=r, column=2, value=v)

# South R32 (Col C)
for r, v in {24:'Iowa', 28:'Nebraska', 32:'Illinois', 36:'Houston'}.items():
    ws.cell(row=r, column=3, value=v)

# South S16 (Col D)
for r, v in {24:'Iowa', 32:'Illinois'}.items():
    ws.cell(row=r, column=4, value=v)

# South E8 (Col E)
ws.cell(row=24, column=5, value='Illinois')

# Midwest R64 (Col L)
for r, v in {24:'Michigan', 26:'Saint Louis', 28:'Texas Tech', 30:'Alabama',
             32:'Tennessee', 34:'Virginia', 36:'Kentucky', 38:'Iowa St'}.items():
    ws.cell(row=r, column=12, value=v)

# Midwest R32 (Col K)
for r, v in {24:'Michigan', 28:'Alabama', 32:'Tennessee', 36:'Iowa St'}.items():
    ws.cell(row=r, column=11, value=v)

# Midwest S16 (Col J)
for r, v in {24:'Michigan', 32:'Tennessee'}.items():
    ws.cell(row=r, column=10, value=v)

# Midwest E8 (Col I)
ws.cell(row=24, column=9, value='Michigan')

# Tiebreaker section
ws['A44'] = 'TIE BRAKER'
ws['H44'] = 'R1'
ws['I44'] = 'R2'
ws['J44'] = 'R3'
ws['K44'] = 'R4'
ws['L44'] = 'Final'
ws['G45'] = 'Round'
ws['G46'] = 'Total'

# ============ SHEET 2: FULL GAME SCORES ============
ws2 = wb.create_sheet("Game Scores")
headers = ['Round', 'Region', 'W Seed', 'Winner', 'W Score', 'L Seed', 'Loser', 'L Score']
bold = Font(bold=True)
for i, h in enumerate(headers, 1):
    c = ws2.cell(row=1, column=i, value=h)
    c.font = bold

games = [
    # First Four
    ['First Four', 'Midwest (16)', 16, 'Howard', 86, 16, 'UMBC', 83],
    ['First Four', 'West (11)', 11, 'Texas', 68, 11, 'NC State', 66],
    ['First Four', 'South (16)', 16, 'Prairie View A&M', None, 16, 'Lehigh', None],
    ['First Four', 'Midwest (11)', 11, 'Miami (OH)', None, 11, 'SMU', None],
    # East R64
    ['Round of 64', 'East', 1, 'Duke', 71, 16, 'Siena', 65],
    ['Round of 64', 'East', 9, 'TCU', 66, 8, 'Ohio State', 64],
    ['Round of 64', 'East', 5, "St. John's", 79, 12, 'Northern Iowa', 53],
    ['Round of 64', 'East', 4, 'Kansas', 68, 13, 'California Baptist', 60],
    ['Round of 64', 'East', 6, 'Louisville', 83, 11, 'South Florida', 79],
    ['Round of 64', 'East', 3, 'Michigan State', 92, 14, 'North Dakota State', 67],
    ['Round of 64', 'East', 7, 'UCLA', 75, 10, 'UCF', 71],
    ['Round of 64', 'East', 2, 'UConn', 82, 15, 'Furman', 71],
    # West R64
    ['Round of 64', 'West', 1, 'Arizona', 92, 16, 'LIU', 58],
    ['Round of 64', 'West', 9, 'Utah State', 86, 8, 'Villanova', 76],
    ['Round of 64', 'West', 12, 'High Point', 83, 5, 'Wisconsin', 82],
    ['Round of 64', 'West', 4, 'Arkansas', 97, 13, "Hawai'i", 78],
    ['Round of 64', 'West', 11, 'Texas', 79, 6, 'BYU', 71],
    ['Round of 64', 'West', 3, 'Gonzaga', 73, 14, 'Kennesaw State', 64],
    ['Round of 64', 'West', 7, 'Miami (FL)', 80, 10, 'Missouri', 66],
    ['Round of 64', 'West', 2, 'Purdue', 104, 15, 'Queens', 71],
    # South R64
    ['Round of 64', 'South', 1, 'Florida', 114, 16, 'Prairie View A&M', 55],
    ['Round of 64', 'South', 9, 'Iowa', 67, 8, 'Clemson', 61],
    ['Round of 64', 'South', 5, 'Vanderbilt', 78, 12, 'McNeese', 68],
    ['Round of 64', 'South', 4, 'Nebraska', 76, 13, 'Troy', 47],
    ['Round of 64', 'South', 11, 'VCU', 82, 6, 'North Carolina', 78],
    ['Round of 64', 'South', 3, 'Illinois', 105, 14, 'Penn', 70],
    ['Round of 64', 'South', 10, 'Texas A&M', 63, 7, "Saint Mary's", 50],
    ['Round of 64', 'South', 2, 'Houston', 78, 15, 'Idaho', 47],
    # Midwest R64
    ['Round of 64', 'Midwest', 1, 'Michigan', 101, 16, 'Howard', 80],
    ['Round of 64', 'Midwest', 9, 'Saint Louis', 102, 8, 'Georgia', 77],
    ['Round of 64', 'Midwest', 5, 'Texas Tech', 91, 12, 'Akron', 71],
    ['Round of 64', 'Midwest', 4, 'Alabama', 90, 13, 'Hofstra', 70],
    ['Round of 64', 'Midwest', 6, 'Tennessee', 78, 11, 'Miami (OH)', 56],
    ['Round of 64', 'Midwest', 3, 'Virginia', 82, 14, 'Wright State', 73],
    ['Round of 64', 'Midwest', 7, 'Kentucky', 89, 10, 'Santa Clara', 84],
    ['Round of 64', 'Midwest', 2, 'Iowa State', 108, 15, 'Tennessee State', 74],
    # Round of 32
    ['Round of 32', 'East', 1, 'Duke', 81, 9, 'TCU', 58],
    ['Round of 32', 'East', 5, "St. John's", 67, 4, 'Kansas', 65],
    ['Round of 32', 'East', 3, 'Michigan State', 77, 6, 'Louisville', 69],
    ['Round of 32', 'East', 2, 'UConn', 73, 7, 'UCLA', 57],
    ['Round of 32', 'West', 1, 'Arizona', 78, 9, 'Utah State', 66],
    ['Round of 32', 'West', 4, 'Arkansas', 94, 12, 'High Point', 88],
    ['Round of 32', 'West', 11, 'Texas', 74, 3, 'Gonzaga', 68],
    ['Round of 32', 'West', 2, 'Purdue', 79, 7, 'Miami (FL)', 69],
    ['Round of 32', 'South', 9, 'Iowa', 73, 1, 'Florida', 72],
    ['Round of 32', 'South', 4, 'Nebraska', 74, 5, 'Vanderbilt', 72],
    ['Round of 32', 'South', 3, 'Illinois', 76, 11, 'VCU', 55],
    ['Round of 32', 'South', 2, 'Houston', 88, 10, 'Texas A&M', 57],
    ['Round of 32', 'Midwest', 1, 'Michigan', 95, 9, 'Saint Louis', 72],
    ['Round of 32', 'Midwest', 4, 'Alabama', 90, 5, 'Texas Tech', 65],
    ['Round of 32', 'Midwest', 6, 'Tennessee', 79, 3, 'Virginia', 72],
    ['Round of 32', 'Midwest', 2, 'Iowa State', 82, 7, 'Kentucky', 63],
    # Sweet 16
    ['Sweet 16', 'East', 1, 'Duke', 80, 5, "St. John's", 75],
    ['Sweet 16', 'East', 2, 'UConn', 67, 3, 'Michigan State', 63],
    ['Sweet 16', 'West', 1, 'Arizona', 109, 4, 'Arkansas', 88],
    ['Sweet 16', 'West', 2, 'Purdue', 79, 11, 'Texas', 77],
    ['Sweet 16', 'South', 9, 'Iowa', 77, 4, 'Nebraska', 71],
    ['Sweet 16', 'South', 3, 'Illinois', 65, 2, 'Houston', 55],
    ['Sweet 16', 'Midwest', 1, 'Michigan', 90, 4, 'Alabama', 77],
    ['Sweet 16', 'Midwest', 6, 'Tennessee', 76, 2, 'Iowa State', 62],
    # Elite 8
    ['Elite 8', 'East', 2, 'UConn', 73, 1, 'Duke', 72],
    ['Elite 8', 'West', 1, 'Arizona', 79, 2, 'Purdue', 64],
    ['Elite 8', 'South', 3, 'Illinois', 71, 9, 'Iowa', 59],
    ['Elite 8', 'Midwest', 1, 'Michigan', 95, 6, 'Tennessee', 62],
    ['Final Four', 'Semifinal 1', 2, 'UConn', 71, 3, 'Illinois', 62],
    ['Final Four', 'Semifinal 2', 1, 'Michigan', 91, 1, 'Arizona', 73],
    ['Championship', 'Final', None, 'UConn', None, None, 'Michigan', None],
]

for row_idx, game in enumerate(games, 2):
    for col_idx, val in enumerate(game, 1):
        ws2.cell(row=row_idx, column=col_idx, value=val)

# Auto-width
for col in ws2.columns:
    max_len = 0
    col_letter = col[0].column_letter
    for cell in col:
        if cell.value:
            max_len = max(max_len, len(str(cell.value)))
    ws2.column_dimensions[col_letter].width = min(max_len + 3, 30)

# ============ SHEET 3: FINAL FOUR ============
ws3 = wb.create_sheet("Final Four")
ws3['A1'] = 'Final Four - April 4, 2026 - Lucas Oil Stadium, Indianapolis'
ws3['A1'].font = Font(bold=True, size=12)
ws3['A3'] = 'Semifinal 1 (6:09 PM ET):'
ws3['A3'].font = Font(bold=True)
ws3['A4'] = 'East Champion: (2) UConn'
ws3['A5'] = 'South Champion: (3) Illinois'
ws3['A7'] = 'Semifinal 2 (8:49 PM ET):'
ws3['A7'].font = Font(bold=True)
ws3['A8'] = 'West Champion: (1) Arizona'
ws3['A9'] = 'Midwest Champion: (1) Michigan'
ws3['A11'] = 'Championship Game - April 6, 2026 (8:50 PM ET):'
ws3['A11'].font = Font(bold=True)
ws3['A12'] = '(2) UConn vs (1) Michigan'
ws3['A14'] = 'NOTE: Final Four results are final. Championship is next.'
ws3['A14'].font = Font(bold=True, color='FF0000')

wb.save('files/2026_NCAA_Actual_Results.xlsx')
print("Done! Created: files/2026_NCAA_Actual_Results.xlsx")

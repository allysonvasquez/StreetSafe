import camelot

print('1')
file = 'crime.pdf'

tables = camelot.read_pdf(file)
print('2')
# Read pdf into list of DataFrame
#df = tabula.read_pdf("crime.pdf", pages='all')

# convert PDF into CSV file
#tabula.convert_into("test.pdf", "data/crime_data.csv", output_format="csv", pages='all')

print('Tables Printed:', tables.n)
tables.export("foo.csv", f="csv", compress=True)
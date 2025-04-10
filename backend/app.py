from flask import Flask
from routes.leads import leads_blueprint
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.register_blueprint(leads_blueprint, url_prefix='/api/leads')

if __name__ == '__main__':
    app.run(debug=True)
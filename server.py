from flask import Flask, render_template
import os


app = Flask(__name__)
if 'HEROKU' in os.environ: # Production mode
    pass
else:
    app.debug = True


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0')

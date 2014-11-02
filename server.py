from flask import Flask, abort, jsonify, render_template, request, session, url_for
from jinja2 import TemplateNotFound
import os


app = Flask(__name__)
app.secret_key = 'huehuehuehuehuehuehue' # very secure
if 'HEROKU' in os.environ: # Production mode hack
    pass
else:
    app.debug = True


@app.route('/')
def index():
    return render_template('index.html', debug=app.debug)

@app.route('/login', methods=['POST'])
def login():
    session['username'] = request.form['username']
    return jsonify(success=True)


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify(success=True)


# Creepy government stuff
@app.route('/user/ip')
def get_ip():
    return jsonify(ip=request.remote_addr)


if __name__ == "__main__":
    app.run(host='0.0.0.0')

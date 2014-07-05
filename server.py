from flask import Flask, render_template, abort
from jinja2 import TemplateNotFound
import os


app = Flask(__name__)
if 'HEROKU' in os.environ: # Production mode hack
    pass
else:
    app.debug = True


@app.route('/')
def index():
    return render_template('index.html', debug=app.debug)

@app.route('/commands/<template>')
def get_command_template(template):
    try:
        return render_template('commands/%s.html' % template)
    except TemplateNotFound:
        abort(404)

@app.route('/man/<template>')
def get_man_template(template):
    try:
        return render_template('man/%s.html' % template)
    except TemplateNotFound:
        abort(404)


if __name__ == "__main__":
    app.run(host='0.0.0.0')

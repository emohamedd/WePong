FROM python:3.10-slim

WORKDIR /backend

RUN python -m venv /opt/venv

RUN /opt/venv/bin/pip install --upgrade pip

COPY requirements.txt .

RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

COPY ./backend .

ENV PATH="/opt/venv/bin:$PATH"

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "localhost:8000"]
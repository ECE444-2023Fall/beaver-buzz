import os.path
import smtplib, imaplib, ssl
import email
from email_validator import validate_email, EmailNotValidError
import pandas as pd
import logging
from typing import Iterable
from tqdm import tqdm

logging.basicConfig(filename='mail.log', encoding='utf-8', level=logging.DEBUG)

class Mailer:
    def __init__(self, smtp: str, port: int, login: tuple[str, str]) -> None:
        self.context = ssl.create_default_context()
        self.server = smtplib.SMTP_SSL(smtp, port, context=self.context)
        self.sender = login[0]
        self.server.login(self.sender, login[1])

    def __repr__(self) -> str:
        return str(self.server.helo())

    def send_mail(self, recipient: str, content: str, validate:bool=True) -> None:
        if validate:
            try:
                validate_email(recipient) # This may be redundant, but in the event emails need to be sent to people outside our db
                self.server.sendmail(self.sender, recipient, content)
            except EmailNotValidError as e:
                logging.error(str(e))
        else:
            logging.warn('Sending email with no validation...')
            self.server.sendmail(self.sender, recipient, content)

    def mass_mail(self, recipients: Iterable[str], content: str, validate:bool=True) -> None:
        for r in tqdm(recipients):
            send_mail(r, content, validate)

    def kill(self) -> None:
        return logging.info(self.server.quit())


class Inbox:
    def __init__(self, imap: str, port: int, login: tuple[str,str]) -> None:
        self.server = imaplib.IMAP4_SSL(imap, port)
        self.addr = login[0]
        self.server.login(self.addr, login[1])

    def read_dir(self, dir: str) -> email.message.Message | None:
        ret = []
        self.server.select(dir)
        status, email_ids = self.server.search(None, 'ALL')

        if status == 'OK':
            em_id_list = email_ids[0].split()
            for em_id in em_id_list:
                status, email_data = self.server.fetch(em_id, '(RFC822)')
                if status == 'OK':
                    ret.append(email.message_from_bytes(email_data[0][1]))
            return ret
        return None

    def kill(self) -> None:
        self.server.close()
        self.server.shutdown()
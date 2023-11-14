import os, os.path
import sys
import smtplib, ssl
from email_validator import validate_email, EmailNotValidError
import pandas as pd
import logging
import imaplib
import pytest

pwd = os.path.dirname(__file__)
emails_path = os.path.join(pwd, "../../emails")
sys.path.append(emails_path)

from mailing import Mailer, Inbox, format_email, print_dir


smtp_local = "localhost"
local_port = 1025  # tls

goog_smtp = "smtp.gmail.com"
goog_ports_smtp = [465, 587]  # [ssl, tls]
goog_imap = "imap.gmail.com"
goog_ports_imap = [993]


class TestEmail:
    """
    Tests basic read/send email system using Gmail SMTP and IMAP4 servers.
    By @ChNgineer | Ryan Chen
    """

    def test_sender_login(self):
        """
        Tests email composer account login capabilities
        """
        self.smtp_server = goog_smtp
        self.smtp_port = goog_ports_smtp[0]
        self.login = (os.environ['GMAIL_LOGIN'], os.environ['GMAIL_APP_PWD'])
        self.mailer = Mailer(self.smtp_server, self.smtp_port, self.login)
        verif = self.mailer.server.verify(self.smtp_server)
        assert verif[0] in [250, 251, 252]
        self.mailer.kill()

    def test_inbox_login(self):
        """
        Tests account inbox login capabilities, then severs connection
        """
        self.imap_server = goog_imap
        self.imap_port = goog_ports_imap[0]
        self.login = (os.environ['GMAIL_LOGIN'], os.environ['GMAIL_APP_PWD'])
        self.inbox = Inbox(self.imap_server, self.imap_port, self.login)
        self.inbox.server.select("Inbox")
        assert self.inbox.server.check()
        self.inbox.server.close()
        self.inbox.kill()

    def test_reg_email(self):
        """
        Tests sending and receiving emails from data using basic registration template.
        Emails are sent to the same account they were composed on, and SUBJECT is checked to match.
        Emails are then deleted afterwards and connection is severed.
        """
        self.smtp_server = goog_smtp
        self.smtp_port = goog_ports_smtp[0]
        self.login = (os.environ['GMAIL_LOGIN'], os.environ['GMAIL_APP_PWD'])
        self.mailer = Mailer(self.smtp_server, self.smtp_port, self.login)

        self.imap_server = goog_imap
        self.imap_port = goog_ports_imap[0]
        self.inbox = Inbox(self.imap_server, self.imap_port, self.login)

        subject = "Registration Confirmation"
        mailing_list = pd.read_csv(f"{pwd}/mailing_test_data.csv")
        recipient = mailing_list.iloc[0]

        html = (
            open(os.path.join(emails_path, "registration.html"))
            .read()
            .format(
                subject=subject,
                firstname=recipient["firstname"],
                lastname=recipient["lastname"],
                email=recipient["email"],
                phonenumber=recipient["phonenumber"],
                interests=recipient["interests"],
                potatoemail=self.mailer.sender,
            )
        )
        msg = format_email(self.mailer.sender, recipient["email"], subject, html)
        self.mailer.send_mail(recipient["email"], msg.as_string())

        mail = self.inbox.read_dir("Inbox")
        assert any([m["subject"] == subject for m in mail])
        print("Test Registration Email Detected in Inbox")

        print_dir(self.inbox.read_dir("Inbox", f'(SUBJECT "{subject}")'))

        self.inbox.delete_email("Inbox", f'(SUBJECT "{subject}")')
        assert ~any([m["subject"] == subject for m in mail])
        print("Test Emails Cleared from Inbox\nTest Passed\n")

        self.inbox.kill()
        self.mailer.kill()

const express = require('express');

const router = express.Router();

router.get('/vera-benutzung-2.frontend/default', (req, res) => {
  res.send({
    "name": "vera-benutzung-2.frontend",
    "profiles": ["default"],
    "label": null,
    "version": null,
    "state": null,
    "propertySources": [
      {
        "name": "vera-benutzung-2.frontend-default",
        "source": {
          "vera-benutzung-2.frontend.manual-url": "http://localhost:3000/benutzung/manual.pdf"
        }
      },
      {
        "name": "application-default",
        "source": {
          "spring.mail.host": "smtp.gmail.com",
          "spring.mail.username": "stx@google.de",
          "spring.mail.password": "smtp_password",
          "spring.mail.port": "465",
          "spring.mail.properties.mail.from": "stx@google.de",
          "spring.mail.properties.mail.smtp.auth": "true",
          "spring.mail.properties.mail.smtp.ssl.enable": "true",
          "spring.mail.properties.mail.smtp.starttls.enabled": "true",
          "vera-benutzung-2.bufservice.url": "https://vb2.dev.startext.de/bufservice",
          "vera-benutzung-2.orderservice.url": "https://vb2.dev.startext.de/orderservice",
          "vera-benutzung-2.reproductionservice.url": "https://vb2.dev.startext.de/reproductionservice",
          "vera-benutzung-2.statservice.url": "https://vb2.dev.startext.de/statservice",
          "vera-benutzung-2.sufservice.url": "https://vb2.dev.startext.de/sufservice",
          "vera-benutzung-2.syncservice.url": "https://vb2.dev.startext.de/syncservice",
          "vera-benutzung-2.userservice.url": "https://vb2.dev.startext.de/userservice",
          "vera-benutzung-2.authservice-drupal.url": "https://vb2.dev.startext.de/authservice-drupal",
          "viewer.base-url.mets": "http://bilderserver.lav.nrw.de/intern/mets.aspx?fileName=",
          "viewer.dips.url": "http://bilderserver.lav.nrw.de/intern/Access.xhtml?IEID={0}&titel={1}&signatur={2}&timestamp={3}&modus={4}&crypt=false",
          "viewer.dips.mode": "lesesaalnutzer",
          "viewer.dips.crypt.key": "09812nason1a46s6"
        }
      }
    ]
  }
  )
});

module.exports = router;
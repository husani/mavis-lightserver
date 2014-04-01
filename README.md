mavis-lightserver
=================

1. Edit config.js; add bridge IP and registered username.

2. Run "node populate-db" to add records for all existing lights.

3. Run "node mavis-lightserver" to a) spawn http server, listening/acting on requests; b) use faye to emit light system status for use by other mavis services and clients.


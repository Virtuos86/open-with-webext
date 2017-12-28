#!/usr/bin/env python
# coding: utf-8

import sys
import json
import struct
import subprocess

args = sys.argv
if len(args) != 3 or args[2] != 'virtuos86@open.with':
    sys.exit(0)

# Read a message from stdin and decode it.
def getMessage():
    rawLength = sys.stdin.read(4)
    if len(rawLength) == 0:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.read(messageLength)
    return json.loads(message)

# Encode a message for transmission,
# given its content.
def encodeMessage(messageContent):
    encodedContent = json.dumps(messageContent)
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}

# Send an encoded message to stdout
def sendMessage(encodedMessage):
    sys.stdout.write(encodedMessage['length'])
    sys.stdout.write(encodedMessage['content'])
    sys.stdout.flush()

receivedMessage = getMessage()
magic_pos_start_name = 4
len_name = int(receivedMessage[:magic_pos_start_name].lstrip())
app_name = receivedMessage[magic_pos_start_name : magic_pos_start_name + len_name]
pos_start_title = magic_pos_start_name + len_name + 2
len_title = int(receivedMessage[magic_pos_start_name + len_name:pos_start_title].lstrip())
document_title = receivedMessage[pos_start_title : pos_start_title + len_title]
document_path = "/tmp/" + document_title

open(document_path, "wb").write(receivedMessage[pos_start_title + len_title:].encode("utf-8"))
try:
    retcode = subprocess.call('%s "%s"' % (app_name, document_path), shell=True)
    if retcode < 0:
        message = "Child was terminated by signal " + str(-retcode)
    else:
        message = "Child returned " + str(-retcode)
except OSError as e:
    message = "Execution failed: " + str(e)

sendMessage(encodeMessage(message))

import hashlib


def obfuscate(data):
    return hashlib.sha1(repr(data) + "," + 'FBUid4982').hexdigest()
import urllib
import ImageFile

def getsizes(uri):
    # get file size *and* image size (None if not known)
    file = urllib.urlopen(uri)
    size = file.headers.get("content-length")
    if size: size = int(size)
    p = ImageFile.Parser()
    while 1:
        data = file.read(1024)
        if not data:
            break
        p.feed(data)
        if p.image:
            return size, p.image.size
            break
    file.close()
    return size, None

if __name__ == '__main__':
    print getsizes("https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn2/371270_100004589467725_941874697_n.jpg")
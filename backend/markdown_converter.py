import re
from html.parser import HTMLParser

class HTML2WhatsAppMarkdown(HTMLParser):
    def __init__(self):
        super().__init__()
        self.markdown = []
        self.bold = False
        self.italic = False
        self.list_item = False
        
    def handle_starttag(self, tag, attrs):
        if tag == 'strong' or tag == 'b':
            self.bold = True
            self.markdown.append('*')
        elif tag == 'em' or tag == 'i':
            self.italic = True
            self.markdown.append('_')
        elif tag == 'li':
            self.list_item = True
            self.markdown.append('\n• ')
        elif tag == 'br':
            self.markdown.append('\n')
    
    def handle_endtag(self, tag):
        if tag == 'strong' or tag == 'b':
            self.markdown.append('*')
            self.bold = False
        elif tag == 'em' or tag == 'i':
            self.markdown.append('_')
            self.italic = False
        elif tag == 'p':
            self.markdown.append('\n\n')
        elif tag == 'li':
            self.list_item = False
    
    def handle_data(self, data):
        if data.strip():
            self.markdown.append(data)
    
    def get_markdown(self):
        result = ''.join(self.markdown)
        # Clean up multiple newlines
        result = re.sub(r'\n{3,}', '\n\n', result)
        return result.strip()

def html_to_whatsapp_markdown(html: str) -> str:
    """Convert HTML to WhatsApp-compatible markdown"""
    parser = HTML2WhatsAppMarkdown()
    parser.feed(html)
    return parser.get_markdown()

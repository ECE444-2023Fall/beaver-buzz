import re

def fuzzy_match(input_text, search_string):
    pattern = ""
    for char in search_string:
        pattern += f"{char}|"

    pattern = pattern[:-1]  # Remove the trailing "|"

    regex = re.compile(pattern)
    match = regex.search(input_text)

    if match:
        return True
    else:
        return False

if __name__ == "__main__":
    import sys

    if len(sys.argv) != 3:
        print("Usage: python fuzzy_match.py <input_text> <search_string>")
    else:
        input_text = sys.argv[1]
        search_string = sys.argv[2]
        result = fuzzy_match(input_text, search_string)
        if result:
            print("Fuzzy match found!")
        else:
            print("No fuzzy match found.")

import random

def classify(nir_value):
    if nir_value < 300:
        return "Plastic"
    elif 300 <= nir_value < 600:
        return "Paper"
    else:
        return "Organic"

for i in range(5):
    value = random.randint(200, 800)
    print("NIR Value:", value, "->", classify(value))
#include <Servo.h>

Servo flap;

int nirValue = 0;
int fillLevel = 0;   // Simulated fill percentage

void setup() {
  Serial.begin(9600);
  flap.attach(9);
  flap.write(90);
  randomSeed(analogRead(0));
}

void loop() {

  // -------- SIMULATED NIR SENSOR --------
  nirValue = random(200, 800);

  Serial.print("NIR Value: ");
  Serial.println(nirValue);

  if (nirValue < 300) {
    detectPlastic();
  }
  else if (nirValue >= 300 && nirValue < 600) {
    detectPaper();
  }
  else {
    detectOrganic();
  }

  // -------- SIMULATED FILL LEVEL --------
  fillLevel = random(10, 100);

  Serial.print("Bin Fill Level: ");
  Serial.print(fillLevel);
  Serial.println("%");

  if (fillLevel > 80) {
    Serial.println("⚠ ALERT: Bin Almost Full!");
  }

  Serial.println("--------------------------");

  delay(4000);
}

void detectPlastic() {
  Serial.println("Plastic Detected");
  flap.write(30);
  delay(1500);
  flap.write(90);
}

void detectPaper() {
  Serial.println("Paper Detected");
  flap.write(120);
  delay(1500);
  flap.write(90);
}

void detectOrganic() {
  Serial.println("Organic Detected");
  flap.write(160);
  delay(1500);
  flap.write(90);
}

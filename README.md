# Computergrafik
This repository is a group work in the context of the computer graphics lecture at DHBW-FN, year TIT20.

## How to run
Open up in VS-Code or other Text-Editor. Open up console, run with 'npm run dev'. 

Developed with [Vite](https://vitejs.dev/) and ThreeJS


# Der Canvas
In der 'index.html'-Datei wird ein Canvas erzeugt. Mit diesem Canvas wird ein ThreeJS-Renderer (WebGL)
erzeugt, welcher im Programm dafür benötigt wird die Szene anzuzeigen.

# setupScene()
Die erste Funktion die im Programm aufgerufen wird ist 'setupScene()'. 
Damit die Szene nicht dunkel ist, muss ebenfalls eine Lichtquelle hinzugefügt werden. Ein 'ambientLight' stellt in ThreeJS eine Lichtquelle dar, welche sämtliche Objekte mit der gleichen Intensität beleuchtet. Da die Szene bei Nacht spielt ist dies hierfür unbrauchbar. Es wird deshalb ein 'directionalLight' benutzt, da damit ein Schatten geworfen werden und somit der Mond ideal modeliert werden kann.
Innerhalb von 'setupScene()' werden sämtliche Objekte initialisiert, welche gerendert werden müssen. Alle Objekte, welche innerhalb der Szene genutzt werden sind im GLTF/GLB Format und müssen deshalb über einen GLTF-Loader geladen werden. Dies wird im folgenden dargestellt.
Bevor der GLTF-Loader erstellt wird, muss ein 'loadingManager' von ThreeJS erstellt werden, welcher bei der Erstellung des GLTF-Loaders als Parameter mitgeben wird. Der Manager ist dafür zuständig, um festzustellen, wenn alle Objekte vollständig geladen sind. 'loadingManager.onLoad()' wird ausgeführt, wenn dies der Fall ist.
Sobald alle Objekte geladen sind, wir die animate Funktion ausgeführt, welche rekursiv immer wieder aufgerufen wird und unsere Programmschleife bildet.

# animate()
Kutsche und Wölfe besitzen Animationen, welche geupdatet werden müssen. Damit die Animationen korrekt geupdatet werden können, muss die vergangene Zeit seit dem letzten Programmdurchlauf bestimmt werden. Jedes Objekt besitzt seinen eigenen Mixer, welcher mit der vergangenen Zeit geupdatet wird. Da die Möglichkeit besteht, dass der Mixer noch nicht fertig initialisiert wurde, muss überprüft werden ob er nicht undefined ist.
Unsere Kutsche bewegt sich in X-Richtung, deshalb muss sich unsere Kamera mitbewegen. 



Programmablauf:
    1. Lade Objekte und initialisiere Szene
    2. Startbildschirm, warte auf ESC-Taste
    3. ESC wurde gedrückt, starte Spiel
    4. Gab es eine Kollision von der Kutsche oder Wölfen   
        a. Wenn ja agiere entsprechend, danach weiter mit 5 oder 7, wenn Kutsche getroffen
        b. Wenn nein, tue nichts
    5. Update Postion von Objekten
    6. erhöhe Geschwindigkeit und Highscore, springe zu 4
    7. Zeige gameover an, warte auf ESC für Start von neuem Spiel. Wenn gedrückt setze Objekte zurück und springe zu 3.

Ideen für Code-Snippets:
Wie werden Objekte geladen?
Wie werden bereits gerenderte Objekte aktualisiert?
Wie wird Collision Detection implementiert?
Wie funktioniert das wechseln der Spuren?

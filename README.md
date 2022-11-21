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
Kutsche und Wölfe besitzen Animationen, welche geupdatet werden müssen. Damit die Animationen korrekt geupdatet werden können, muss die vergangene Zeit seit dem letzten Programmdurchlauf bestimmt werden. Jedes Objekt besitzt seinen eigenen Mixer, welcher mit der vergangenen Zeit geupdatet wird.
Mit jedem Durchlauf der Programmschleife wird die Geschwindigkeit der Kutsche erhöht. Da sich die Wölfe an der Geschwindigkeit der Kutsche orientieren, müssen diese auch geupdatet werden. Danach werden sämtliche Objekte, der Highscore und die Kamera geupdatet. 
Nachdem alles aktuell ist, kann die Szene neu gerendert werden.

# Updaten der Objekte
Immer wenn ein Objekt außerhalb des gerenderten Views liegt, muss es geupdatet und somit nach vorne gesetzt werden. Hierbei entsteht der Vorteil, dass keine neuen Objekte erstellt werden müssen, sondern lediglich die vorhandenen verschoben. Diese Vorgehensweise kann anhand des Straßen-Elements beispielhaft erklärt werden. 
Zuerst wird die X-Distanz des jeweiligen Objektes zur Kutsche berechnet. Wenn die Distanz eine gewisse Schwelle (hängt von der Länge des jeweiligen Objektes ab) überschreitet, wird das Element vor alle anderen Elemente gesetzt. Das Array für die Straßen ist so aufgebaut, dass sämtliche Elemente einer einzigen Spur aneinander gehängt werden. Damit der  gerenderte View optimal angezeigt wird, werden 15 Straßen-Elemente pro Spur benötigt.
Somit sind die Indizes 0-14 für die linke Spur, 15-29 für die mittlere Spur und 30-44 für die rechte Spur. Wenn ich die 3 Straßen-Elemente, welche von Anfang an am weitesten hinten liegen, verschieben möchte, greife ich also auf die Indizes 0, 15 und 30 zurück und verschiebe sie um die Anzahl an Straßen Elementen mal der Länge eines Straßen Elements.

# Collision Detection
In diesem Abschnitt wird erklärt, wie die Dimensionen eines Objektes erfasst werden und wie eine Kollision von zwei Objekten erkannt wird.
## 'Box3'
Jedes Objekt besteht aus vielen Vertices. ThreeJS bietet die Möglichkeit mit 'Box3' eine Box um ein Objekt zu zeichnen, welche die maximalen, sowie minimalen, Dimensionen des jeweiligen Objektes speichert. An manchen Stellen muss diese Box noch geupdatet werden, da beispielsweise unser großes Hindernis (Baum) von der maximalen Z-Dimension größer ist als eine Spur. Wenn die Box nicht geupdatet wird, würde selbst eine Kollision erkannt werden, wenn die Kutsche sich nicht auf der Spur des Baumes befindet.
## Erkennen der Kollision
Da sich die Objekte bewegen, müssen die jeweiligen Boxen immer aktualisiert werden, weil ansonsten eine Kollision zu spät oder gar nicht erkannt wird. Immer nachdem ein Objekt innerhalb der Szene bewegt wird, welches die Möglichkeit besitzt mit anderen Objekten zusammenzustoßen, muss seine Hitbox aktualisiert werden. Nachdem das Objekt aktualisiert wurde, muss auf eine Kollision überprüft werden, hierfür wird die Funktion 'intersectsBox()' der Klasse 'Box3' genutzt werden. Als Parameter wird dieser Funktion eine andere Box gegeben. Wenn die Dimensionen der Boxen sich in irgendeiner Weise überschneiden, gibt diese Funktion 'true' zurück. Dieser Boolean kann ausgewertet werden.

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

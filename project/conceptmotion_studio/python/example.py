from conceptmotion import table_window_scene

scene = table_window_scene()
print(scene.json())
scene.write("generated/rolling-window.scene.json")

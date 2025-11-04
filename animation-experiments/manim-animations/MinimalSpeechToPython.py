from manim import *

class MinimalSpeechToPython(Scene):
    def construct(self):
        # 1. Draw a minimalistic face (circle + mouth)
        face = Circle(radius=0.7, color=WHITE).shift(LEFT*3)
        mouth = Arc(radius=0.25, angle=PI, color=WHITE).move_to(face.get_center() + DOWN*0.2 + RIGHT*0.05)
        face_group = VGroup(face, mouth)
        self.play(FadeIn(face_group))
        self.wait(0.3)

        # 2. Speech bubble with text
        bubble = SVGMobject("/Users/greatmaster/Desktop/projects/learning/manim-animations/speech_buble.svg")
        bubble.set(width=2.5).next_to(face, RIGHT, buff=0.5)
        speech = Text("print('Hello!')", font_size=32, color=WHITE).move_to(bubble.get_center() + UP*0.1)
        self.play(FadeIn(bubble), Write(speech))
        self.wait(0.5)

        # 3. Speech morphs into Python logo
        python_logo = SVGMobject("/Users/greatmaster/Desktop/projects/learning/manim-animations/python_file_icon.svg")
        python_logo.set(width=1.5).move_to(speech.get_center())
        self.play(Transform(speech, python_logo), run_time=1)
        self.wait(1)

        # 4. Draw a minimal computer (rectangle + screen)
        computer = Rectangle(width=2.5, height=1.5, color=BLUE_B).to_edge(RIGHT, buff=1.5)
        screen = Rectangle(width=2, height=1, color=WHITE).move_to(computer.get_center())
        computer_group = VGroup(computer, screen)
        self.play(FadeIn(computer_group))
        self.wait(0.3)

        # 5. Python logo gets sucked into the computer
        self.play(python_logo.animate.move_to(screen.get_center()).scale(0.5), FadeOut(bubble), run_time=1)
        self.play(FadeOut(python_logo), run_time=0.5)
        self.wait(0.5)

        # 6. End with a simple checkmark on the screen
        check = Tex(r"$\checkmark$", color=GREEN, font_size=80).move_to(screen.get_center())
        self.play(FadeIn(check), run_time=0.7)
        self.wait(1) 
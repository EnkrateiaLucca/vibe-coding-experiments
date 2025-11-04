from manim import *
import numpy as np

class CodingComplexityToSimplicity(Scene):
    def construct(self):
        # 1. Chaotic tangled network of red/yellow nodes
        nodes = VGroup()
        edges = VGroup()
        np.random.seed(42)
        N = 18
        positions = [np.random.uniform(-4, 4, 2) for _ in range(N)]
        colors = [RED if i % 2 == 0 else YELLOW for i in range(N)]
        for i, pos in enumerate(positions):
            node = Dot(point=[*pos, 0], color=colors[i], radius=0.18)
            nodes.add(node)
        # Connect nodes with random edges
        for i in range(N):
            for j in range(i+1, N):
                if np.random.rand() < 0.25:
                    edge = Line(nodes[i].get_center(), nodes[j].get_center(), color=colors[i], stroke_width=2)
                    edges.add(edge)
        network = VGroup(edges, nodes)
        self.play(FadeIn(network))
        self.wait(0.5)

        # 2. Timer counts up (hours wasted)
        timer = Integer(0, color=WHITE, font_size=48).to_corner(UR)
        timer_label = Text("hours wasted", font_size=28).next_to(timer, DOWN, buff=0.1)
        self.add(timer, timer_label)
        for t in range(0, 7):
            self.play(timer.animate.set_value(t), run_time=0.3)
        self.wait(0.3)
        for t in range(7, 24, 2):
            self.play(timer.animate.set_value(t), run_time=0.15)
        self.wait(0.2)

        # 3. Network grows exponentially
        new_nodes = VGroup()
        new_edges = VGroup()
        for i in range(N, N+8):
            pos = np.random.uniform(-5, 5, 2)
            color = RED if i % 2 == 0 else YELLOW
            node = Dot(point=[*pos, 0], color=color, radius=0.18)
            new_nodes.add(node)
            for j in range(len(nodes)):
                if np.random.rand() < 0.2:
                    edge = Line(node.get_center(), nodes[j].get_center(), color=color, stroke_width=2)
                    new_edges.add(edge)
        self.play(FadeIn(new_nodes), FadeIn(new_edges), run_time=1)
        network.add(new_edges, new_nodes)
        self.wait(0.5)

        # 4. Text box appears, someone types prompt
        textbox = RoundedRectangle(corner_radius=0.2, width=5.5, height=0.8, color=BLUE).to_edge(DOWN, buff=1)
        prompt = "Download NASA images in a 4x4 grid"
        prompt_text = Text("", font_size=32, color=WHITE).move_to(textbox.get_center())
        self.play(FadeIn(textbox))
        for i in range(1, len(prompt)+1):
            prompt_text_new = Text(prompt[:i], font_size=32, color=WHITE).move_to(textbox.get_center())
            self.play(Transform(prompt_text, prompt_text_new), run_time=0.04)
        self.wait(0.5)

        # 5. Network folds and transforms into a golden pathway
        golden_path = VMobject(color=ORANGE, stroke_width=10)
        golden_path.set_points_smoothly([[-4, 0, 0], [-2, 1, 0], [0, 0, 0], [2, -1, 0], [4, 0, 0]])
        self.play(
            FadeOut(network),
            Create(golden_path),
            run_time=1.2
        )
        self.wait(0.3)

        # 6. Pathway morphs into a Python file icon
        py_file = SVGMobject("/Users/greatmaster/Desktop/projects/learning/manim-animations/python_file_icon.svg")
        py_file.set(width=2.5).move_to(golden_path.get_center())
        self.play(Transform(golden_path, py_file), run_time=1)
        self.wait(0.3)

        # 7. Dependencies auto-resolve as puzzle pieces
        puzzle_pieces = VGroup()
        for i, dep in enumerate(["requests", "Pillow", "manim"]):
            piece = Square(0.6, color=BLUE, fill_opacity=0.7).next_to(py_file, DOWN, buff=0.2 + i*0.1)
            label = Text(dep, font_size=22, color=WHITE).move_to(piece.get_center())
            puzzle_pieces.add(VGroup(piece, label))
        for piece in puzzle_pieces:
            self.play(FadeIn(piece), run_time=0.3)
            self.play(piece.animate.shift(UP*0.7), run_time=0.2)
        self.wait(0.3)

        # 8. Script runs as a smooth wave flows through it
        wave = FunctionGraph(lambda x: 0.3*np.sin(2*x), x_range=[-1.2, 1.2], color=BLUE_B).move_to(py_file.get_center())
        self.play(Create(wave), run_time=0.7)
        self.wait(0.2)
        self.play(FadeOut(wave), run_time=0.3)

        # 9. NASA images materialize in a 4x4 grid
        grid = VGroup()
        for i in range(4):
            for j in range(4):
                img = Square(0.7, color=WHITE, fill_opacity=1).move_to(np.array([i-1.5, j-1.5, 0]) * 1.1 + py_file.get_center())
                grid.add(img)
        self.play(LaggedStartMap(FadeIn, grid, shift=UP, lag_ratio=0.08), run_time=1.2)
        self.wait(0.5)

        # 10. Timer resets to seconds
        self.play(timer.animate.set_value(0), run_time=0.2)
        timer_label_new = Text("seconds", font_size=28).next_to(timer, DOWN, buff=0.1)
        self.play(Transform(timer_label, timer_label_new), run_time=0.3)
        for t in range(0, 5):
            self.play(timer.animate.set_value(t), run_time=0.12)
        self.wait(0.3)

        # 11. Original network shrinks to a dot
        dot = Dot(color=GREY, radius=0.12).move_to([-5, 3, 0])
        self.play(FadeIn(dot), run_time=0.2)
        self.play(dot.animate.scale(0.1), run_time=0.5)
        self.wait(0.5)

        # 12. End with elegant simplicity
        final_text = Text("From complexity to simplicity", font_size=38, color=BLUE_B).to_edge(DOWN)
        self.play(Write(final_text), run_time=1)
        self.wait(1) 
from manim import *
import random
import numpy as np

class MCPPuzzleAssembly(Scene):
    def construct(self):
        # Title
        title = Text("The Model Context Protocol Revolution", font_size=36, color=WHITE).to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # Stage 1: Scattered Puzzle Pieces
        stage1_title = Text("Before MCP: Scattered Components", font_size=24, color=RED).next_to(title, DOWN, buff=0.5)
        self.play(Write(stage1_title))
        
        # Create puzzle pieces with different shapes and icons
        tools_pieces = VGroup()
        resources_pieces = VGroup()
        prompts_pieces = VGroup()
        
        # Tools (blue pieces with gear-like shapes)
        for i in range(4):
            # Create irregular pentagon for tools
            vertices = []
            for j in range(5):
                angle = j * 2 * PI / 5 + random.uniform(-0.3, 0.3)
                radius = 0.4 + random.uniform(-0.1, 0.1)
                vertices.append([radius * np.cos(angle), radius * np.sin(angle), 0])
            
            tool_piece = Polygon(*vertices, fill_color=BLUE, fill_opacity=0.8, stroke_width=2, stroke_color=WHITE)
            
            # Add gear icon (simplified)
            gear_icon = Star(n=6, outer_radius=0.15, inner_radius=0.08, color=WHITE, fill_opacity=1)
            gear_icon.move_to(tool_piece.get_center())
            
            # Random position
            tool_piece.move_to([random.uniform(-5, -2), random.uniform(-2, 2), 0])
            gear_icon.move_to(tool_piece.get_center())
            
            tool_group = VGroup(tool_piece, gear_icon)
            tools_pieces.add(tool_group)
        
        # Resources (green pieces with different shapes)
        for i in range(4):
            # Create hexagonal pieces for resources
            resource_piece = RegularPolygon(n=6, radius=0.4, fill_color=GREEN, fill_opacity=0.8, stroke_width=2, stroke_color=WHITE)
            
            # Add database icon (simplified)
            db_icon = Rectangle(width=0.2, height=0.15, fill_color=WHITE, fill_opacity=1)
            db_icon.move_to(resource_piece.get_center())
            
            # Random position
            resource_piece.move_to([random.uniform(2, 5), random.uniform(-2, 2), 0])
            db_icon.move_to(resource_piece.get_center())
            
            resource_group = VGroup(resource_piece, db_icon)
            resources_pieces.add(resource_group)
        
        # Prompts (orange pieces with speech bubble shapes)
        for i in range(3):
            # Create rounded rectangle for prompts
            prompt_piece = RoundedRectangle(width=0.8, height=0.5, corner_radius=0.1, 
                                          fill_color=ORANGE, fill_opacity=0.8, stroke_width=2, stroke_color=WHITE)
            
            # Add chat bubble icon
            chat_icon = Circle(radius=0.08, fill_color=WHITE, fill_opacity=1)
            chat_icon.move_to(prompt_piece.get_center())
            
            # Random position
            prompt_piece.move_to([random.uniform(-1, 1), random.uniform(-3, -1), 0])
            chat_icon.move_to(prompt_piece.get_center())
            
            prompt_group = VGroup(prompt_piece, chat_icon)
            prompts_pieces.add(prompt_group)
        
        all_pieces = VGroup(tools_pieces, resources_pieces, prompts_pieces)
        
        # Animate scattered pieces appearing with slight rotation
        for piece_group in all_pieces:
            for piece in piece_group:
                piece.rotate(random.uniform(-PI/4, PI/4))
        
        self.play(LaggedStart(*[FadeIn(piece, shift=UP*0.5) for piece in all_pieces], lag_ratio=0.2))
        
        # Add slight drifting motion to show disconnection
        drift_animations = []
        for piece_group in all_pieces:
            for piece in piece_group:
                drift = piece.animate.shift([random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), 0]).rotate(random.uniform(-PI/8, PI/8))
                drift_animations.append(drift)
        
        self.play(*drift_animations, run_time=2)
        self.wait(1)
        
        # Stage 2: MCP Appears and Attracts Pieces
        self.play(FadeOut(stage1_title))
        stage2_title = Text("MCP: The Organizing Force", font_size=24, color=GOLD).next_to(title, DOWN, buff=0.5)
        self.play(Write(stage2_title))
        
        # Create MCP hexagon in center
        mcp_core = RegularPolygon(n=6, radius=1.0, fill_color=GOLD, fill_opacity=0.9, stroke_width=4, stroke_color=YELLOW)
        mcp_core.move_to(ORIGIN)
        mcp_label = Text("MCP", font_size=24, color=BLACK, weight=BOLD).move_to(mcp_core.get_center())
        
        # Dramatic entrance of MCP with pulsing effect
        self.play(DrawBorderThenFill(mcp_core), run_time=1.5)
        self.play(Write(mcp_label))
        
        # Pulsing effect
        for _ in range(3):
            self.play(mcp_core.animate.scale(1.1).set_fill(opacity=1), run_time=0.3)
            self.play(mcp_core.animate.scale(1/1.1).set_fill(opacity=0.9), run_time=0.3)
        
        # Pieces start moving toward MCP
        attraction_animations = []
        
        # Tools move to left side of MCP
        for i, tool in enumerate(tools_pieces):
            target_pos = mcp_core.get_center() + LEFT * 2.5 + UP * (i - 1.5) * 0.8
            attraction_animations.append(tool.animate.move_to(target_pos).rotate(0))
        
        # Resources move to right side of MCP
        for i, resource in enumerate(resources_pieces):
            target_pos = mcp_core.get_center() + RIGHT * 2.5 + UP * (i - 1.5) * 0.8
            attraction_animations.append(resource.animate.move_to(target_pos).rotate(0))
        
        # Prompts move to bottom of MCP
        for i, prompt in enumerate(prompts_pieces):
            target_pos = mcp_core.get_center() + DOWN * 2.5 + RIGHT * (i - 1) * 1.2
            attraction_animations.append(prompt.animate.move_to(target_pos).rotate(0))
        
        self.play(*attraction_animations, run_time=2.5)
        self.wait(1)
        
        # Stage 3: Assembly into Unified System
        self.play(FadeOut(stage2_title))
        stage3_title = Text("After MCP: Unified AI Platform", font_size=24, color=GREEN).next_to(title, DOWN, buff=0.5)
        self.play(Write(stage3_title))
        
        # Create connecting lines from pieces to MCP
        connections = VGroup()
        
        for piece_group in [tools_pieces, resources_pieces, prompts_pieces]:
            for piece in piece_group:
                line = Line(piece.get_center(), mcp_core.get_center(), stroke_width=3, color=YELLOW)
                connections.add(line)
        
        # Animate connections with particle effects
        self.play(LaggedStart(*[Create(line) for line in connections], lag_ratio=0.1))
        
        # Add connecting arcs between different types of pieces
        arcs = VGroup()
        
        # Connect tools to resources
        for tool in tools_pieces:
            for resource in resources_pieces:
                arc = ArcBetweenPoints(tool.get_center(), resource.get_center(), angle=PI/4)
                arc.set_stroke(GREEN, width=2, opacity=0.6)
                arcs.add(arc)
        
        # Connect resources to prompts
        for resource in resources_pieces:
            for prompt in prompts_pieces:
                arc = ArcBetweenPoints(resource.get_center(), prompt.get_center(), angle=-PI/4)
                arc.set_stroke(BLUE, width=2, opacity=0.6)
                arcs.add(arc)
        
        self.play(LaggedStart(*[Create(arc) for arc in arcs], lag_ratio=0.05), run_time=2)
        
        # Final transformation - everything pulses together
        unified_system = VGroup(mcp_core, mcp_label, all_pieces, connections, arcs)
        
        # Synchronized pulsing to show unity
        for _ in range(2):
            self.play(unified_system.animate.scale(1.05), run_time=0.4)
            self.play(unified_system.animate.scale(1/1.05), run_time=0.4)
        
        # Final message with particle burst effect
        final_message = Text("One Protocol, Infinite Possibilities", font_size=32, color=GOLD, weight=BOLD).to_edge(DOWN)
        
        # Create particle burst from MCP center
        particles = VGroup()
        for _ in range(20):
            particle = Dot(radius=0.05, color=YELLOW)
            particle.move_to(mcp_core.get_center())
            particles.add(particle)
        
        # Animate particles bursting outward
        particle_animations = []
        for particle in particles:
            direction = np.array([random.uniform(-1, 1), random.uniform(-1, 1), 0])
            direction = direction / np.linalg.norm(direction) * random.uniform(2, 4)
            particle_animations.append(particle.animate.shift(direction).fade(1))
        
        self.play(*particle_animations, run_time=1.5)
        self.play(Write(final_message))
        
        # Final zoom out to show the complete system
        self.play(unified_system.animate.scale(0.8), run_time=1.5)
        
        self.wait(3)

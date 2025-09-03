import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Play, BookOpen, Clock, Award, Search, Filter, Star } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isPremium: boolean;
  progress: number; // 0-100
  isCompleted: boolean;
  rating: number;
  studentsCount: number;
  instructor: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Fundamentos do Marketing Digital",
    description: "Aprenda os conceitos básicos do marketing digital para PMEs. Inclui SEO, redes sociais e campanhas pagas.",
    thumbnail: "/placeholder-course.jpg",
    duration: 120,
    difficulty: "beginner",
    category: "Marketing",
    isPremium: false,
    progress: 75,
    isCompleted: false,
    rating: 4.8,
    studentsCount: 1243,
    instructor: "Ana Silva"
  },
  {
    id: "2",
    title: "CRM e Gestão de Clientes",
    description: "Como implementar e usar sistemas CRM para maximizar o relacionamento com clientes.",
    thumbnail: "/placeholder-course.jpg",
    duration: 90,
    difficulty: "intermediate", 
    category: "CRM",
    isPremium: true,
    progress: 0,
    isCompleted: false,
    rating: 4.9,
    studentsCount: 856,
    instructor: "João Santos"
  },
  {
    id: "3",
    title: "Análise Financeira para PMEs",
    description: "Domine os indicadores financeiros essenciais para tomar melhores decisões de negócio.",
    thumbnail: "/placeholder-course.jpg",
    duration: 150,
    difficulty: "advanced",
    category: "Finanças",
    isPremium: true,
    progress: 100,
    isCompleted: true,
    rating: 4.7,
    studentsCount: 532,
    instructor: "Maria Costa"
  },
  {
    id: "4",
    title: "Automatização de Processos",
    description: "Como automatizar tarefas repetitivas e aumentar a eficiência operacional da sua empresa.",
    thumbnail: "/placeholder-course.jpg",
    duration: 75,
    difficulty: "intermediate",
    category: "Operações",
    isPremium: false,
    progress: 30,
    isCompleted: false,
    rating: 4.6,
    studentsCount: 721,
    instructor: "Pedro Oliveira"
  }
];

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800"
};

const difficultyLabels = {
  beginner: "Iniciante",
  intermediate: "Intermédio", 
  advanced: "Avançado"
};

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(courses.map(course => course.category))];

  const handleStartCourse = (course: Course) => {
    if (course.isPremium) {
      toast({
        title: "Curso Premium",
        description: "Este curso requer uma assinatura Pro ou Premium.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Iniciando curso",
      description: `Começando "${course.title}"`
    });
  };

  const handleContinueCourse = (course: Course) => {
    toast({
      title: "Continuando curso",
      description: `Retomando "${course.title}" do ponto onde parou`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Academia Growen</h2>
          <p className="text-muted-foreground">Cursos e trilhas para acelerar seu negócio</p>
        </div>
        
        <Button variant="outline">
          <Award className="w-4 h-4 mr-2" />
          Meus Certificados
        </Button>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {courses.filter(c => c.isCompleted).length}
            </p>
            <p className="text-sm text-muted-foreground">Cursos Concluídos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {courses.filter(c => c.progress > 0 && !c.isCompleted).length}
            </p>
            <p className="text-sm text-muted-foreground">Em Progresso</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)}%
            </p>
            <p className="text-sm text-muted-foreground">Progresso Geral</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {Math.round(courses.reduce((acc, c) => acc + c.duration, 0) / 60)}h
            </p>
            <p className="text-sm text-muted-foreground">Tempo Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as dificuldades</SelectItem>
            <SelectItem value="beginner">Iniciante</SelectItem>
            <SelectItem value="intermediate">Intermédio</SelectItem>
            <SelectItem value="advanced">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
              {course.isPremium && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Premium
                </Badge>
              )}
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
              </div>
              <CardDescription className="text-sm line-clamp-3">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.round(course.duration / 60)}h {course.duration % 60}min
                </div>
                <Badge className={difficultyColors[course.difficulty]}>
                  {difficultyLabels[course.difficulty]}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Por {course.instructor}</span>
                <span>•</span>
                <span>{course.studentsCount} alunos</span>
              </div>
              
              {course.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}
              
              <div className="flex gap-2">
                {course.progress === 0 ? (
                  <Button 
                    onClick={() => handleStartCourse(course)}
                    className="flex-1"
                    variant={course.isPremium ? "outline" : "default"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Começar
                  </Button>
                ) : course.isCompleted ? (
                  <Button variant="outline" className="flex-1">
                    <Award className="w-4 h-4 mr-2" />
                    Revisar
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleContinueCourse(course)}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continuar
                  </Button>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedCourse(course)}>
                      Detalhes
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{selectedCourse?.title}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedCourse && (
                      <div className="space-y-4">
                        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                          <BookOpen className="w-24 h-24 text-muted-foreground" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Duração:</strong> {Math.round(selectedCourse.duration / 60)}h {selectedCourse.duration % 60}min
                          </div>
                          <div>
                            <strong>Dificuldade:</strong> {difficultyLabels[selectedCourse.difficulty]}
                          </div>
                          <div>
                            <strong>Categoria:</strong> {selectedCourse.category}
                          </div>
                          <div>
                            <strong>Instrutor:</strong> {selectedCourse.instructor}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground">{selectedCourse.description}</p>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            {selectedCourse.progress === 0 ? "Começar Curso" : "Continuar"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum curso encontrado com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
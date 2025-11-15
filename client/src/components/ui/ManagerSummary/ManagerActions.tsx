import { useNavigate } from "react-router-dom"
import { Card,CardHeader, CardContent, CardTitle  } from "../Card"
import { Users, FileText } from "lucide-react"


export default function ManagerActions() {

    const navigate = useNavigate();

    return (
    <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 mt-23">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#10b981]" />
                    Gestión Gerencial
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text font-medium text-sm">
                <button  
                    className="w-full flex items-center gap-4 justify-start bg-white rounded-2xl font-bold cursor-pointer shadow-md hover:bg-gray-200 text-gray-800 py-2 px-4 hover:shadow-lg transition-all duration-300 mt-4"
                    onClick={() => navigate('/reports')}
                >
                    <FileText className="w-5 h-5" />
                    Genera Reportes
                </button>  

                <button 
                    className="w-full flex items-center gap-4 justify-start bg-white rounded-2xl font-bold cursor-pointer shadow-md hover:bg-gray-200 text-gray-800 py-2 px-4 hover:shadow-lg transition-all duration-300 mt-4"
                    onClick={() => navigate('/users')}
                >
                    <Users className="w-5 h-5" />
                    Gestionar Usuarios
                </button> 
                </CardContent>

        </Card>
    )
}
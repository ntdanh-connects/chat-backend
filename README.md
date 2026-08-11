## Cấu trúc dự án Clean Architecture
src/
├── domain/             # Core business rules - Không phụ thuộc bất kỳ thư viện ngoài nào
│   ├── entities/       # User.js, Room.js, Message.js
│   ├── value_objects/  # (Chuẩn hóa data types nếu cần)
│   └── interfaces/     # IMessageRepository, IRoomRepository, IUserRepository, ISocketBroadcaster
│
├── application/        # Application business rules (Logic nghiệp vụ)
│   ├── use_cases/      # SendMessageUseCase, LoginUseCase, RegisterUseCase, ...
│   ├── dtos/           # Data Transfer Objects
│   ├── interfaces/     # Interfaces cho Application Layer
│   └── validators/     # Kiểm tra dữ liệu đầu vào (Input validation)
│
├── infrastructure/     # Triển khai các công cụ bên ngoài (Database, Supabase, Socket.IO)
│   ├── persistence/    # Kết nối Database (connection.js)
│   ├── repositories/   # PostgresMessageRepository, PostgresRoomRepository, PostgreUserRepository
│   └── services/       # SupabaseAuthRepository, SupabaseAdminClient, SocketIOBroadcaster
│
└── presentation/       # Tương tác đầu vào/ra (HTTP API, WebSockets, Middlewares, Dependency Injection)
    ├── controllers/    # AuthController, RoomController, MessageController, UserController
    ├── middleware/     # authMiddleware.js
    └── main/           # container.js (DI Container), App Routes setup


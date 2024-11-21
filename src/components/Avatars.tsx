import { Card, CardBody, Image } from "@nextui-org/react";

interface Avatar {
  title: string;
  img: string;
}

interface AvatarsProps {
  currentAvatar: string; // Avatar URL the user currently has
  onSelectAvatar: (avatar: string) => void; // Callback to update the selected avatar
}

export default function Avatars({ currentAvatar, onSelectAvatar }: AvatarsProps) {
  const list: Avatar[] = [
    {
      title: "Avatar 1",
      img: "/avatars/avatar7.svg",
    },
    {
      title: "Avatar 2",
      img: "/avatars/avatar1.svg",
    },
    {
      title: "Avatar 3",
      img: "/avatars/avatar3.svg",
    },
    {
      title: "Avatar 4",
      img: "/avatars/avatar5.svg",
    },
    {
      title: "Avatar 5",
      img: "/avatars/avatar6.svg",
    },
    {
      title: "Avatar 6",
      img: "/avatars/avatar8.svg",
    },
    {
      title: "Avatar 7",
      img: "/avatars/pingu.jpg",
    },
    {
      title: "Avatar 8",
      img: "/avatars/aang.jpg",
    },
    {
      title: "Avatar 9",
      img: "/avatars/gojo.jpg",
    },
  ];

  return (
    <div className="gap-3 grid grid-cols-2 sm:grid-cols-3">
      {list.map((item, index) => (
        <Card
          shadow="sm"
          key={index}
          isPressable
          onPress={() => onSelectAvatar(item.img)} // Update the selected avatar
        >
          <CardBody className="overflow-visible p-0 flex justify-center items-center">
            <Image
              shadow="sm"
              radius="full"
              alt={item.title}
              className="w-24 h-24 object-cover rounded-full border-2 border-gray-300 hover:border-blue-500 hover:shadow-lg hover:scale-102 transition-transform duration-300"
              classNames={{img: "opacity-100"}} 
              src={item.img}
              style={{
                border: currentAvatar === item.img ? '5px solid #10b981' : '2px solid gray',
                boxShadow: currentAvatar === item.img ? '0 0 10px rgba(0, 0, 255, 0.5)' : 'none',
              }}
            />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

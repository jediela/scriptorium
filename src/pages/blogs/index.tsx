import Layout from "@/components/Layout";
import {Pagination} from "@nextui-org/pagination";

export default function Blogs(){

    return(
        <Layout>
            blogs
            <Pagination 
                showControls 
                classNames={{item: "opacity-100"}} 
                color="success" 
                size="lg" 
                total={10} 
                page={1}
                initialPage={1} 
            />


        </Layout>
    )
}